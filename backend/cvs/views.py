from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import CV, CVTranslation
from .serializers import CVSerializer, CVTranslationSerializer
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.viewsets import ModelViewSet
from django.template.loader import render_to_string
from weasyprint import HTML
from django.http import HttpResponse
import tempfile
import os
import pdfkit
from django.conf import settings
from django.template import TemplateDoesNotExist
from .services import TranslationService
import json
from django.utils import timezone
import openai
from django.core.files.storage import default_storage
import uuid

class CVBaseMixin:
    # Desteklenen diller ve OpenAI için karşılıkları
    SUPPORTED_LANGUAGES = {
        'tr': 'Turkish',
        'en': 'English',
        'es': 'Spanish',
        'zh': 'Chinese',
        'ar': 'Arabic',
        'hi': 'Hindi'
    }

    def _get_text_fields_for_type(self, field_type):
        """Her alan tipi için çevrilmesi gereken metin alanlarını döndürür"""
        text_fields_map = {
            'personal_info': ['name', 'title', 'summary', 'address', 'city', 'country'],
            'education': ['school', 'degree', 'field', 'description'],
            'experience': ['company', 'position', 'description'],
            'skills': ['name', 'description'],
            'languages': ['name', 'level'],
            'certificates': ['name', 'issuer', 'description']
        }
        return text_fields_map.get(field_type, [])

    def _get_translated_data(self, instance, lang_code):
        try:
            # İstenen dildeki çeviriyi al
            translation = CVTranslation.objects.get(cv=instance, language_code=lang_code)
            
            # Çeviri verilerini ve diğer CV bilgilerini birleştir
            return {
                'id': instance.id,
                'title': instance.title,
                'status': instance.status,
                'current_step': instance.current_step,
                'user': instance.user.id,
                'created_at': instance.created_at,
                'updated_at': instance.updated_at,
                'video': instance.video.url if instance.video else None,
                'video_description': instance.video_description,
                'language': lang_code,
                'personal_info': translation.personal_info,
                'education': translation.education,
                'experience': translation.experience,
                'skills': translation.skills,
                'languages': translation.languages,
                'certificates': translation.certificates,
            }
        except CVTranslation.DoesNotExist:
            # Fallback to English or original data
            return self._get_fallback_data(instance, lang_code)

    def _get_fallback_data(self, instance, lang_code):
        try:
            # Try English translation first
            en_translation = CVTranslation.objects.get(cv=instance, language_code='en')
            return self._get_translated_data(instance, 'en')
        except CVTranslation.DoesNotExist:
            # Use original data if no translation exists
            return {
                'id': instance.id,
                'title': instance.title,
                'status': instance.status,
                'current_step': instance.current_step,
                'user': instance.user.id,
                'created_at': instance.created_at,
                'updated_at': instance.updated_at,
                'video': instance.video.url if instance.video else None,
                'video_description': instance.video_description,
                'language': 'en',
                'personal_info': instance.personal_info,
                'education': instance.education,
                'experience': instance.experience,
                'skills': instance.skills,
                'languages': instance.languages,
                'certificates': [],  # Varsayılan boş liste
            }

    def _get_language_code(self, request):
        """
        Get the language code from the request.
        First tries to get from request data,
        then from Accept-Language header,
        if not found defaults to 'en'.
        """
        # Try to get language from request data first
        if request.data and 'language' in request.data:
            lang_code = request.data['language'].lower()
            if lang_code in self.SUPPORTED_LANGUAGES:
                print(f"DEBUG: Using language from request data: {lang_code}")
                return lang_code
        
        # Then try Accept-Language header
        accept_language = request.headers.get('Accept-Language')
        if accept_language:
            languages = [lang.split(';')[0].strip() for lang in accept_language.split(',')]
            for lang in languages:
                base_lang = lang.split('-')[0].lower()
                if base_lang in self.SUPPORTED_LANGUAGES:
                    print(f"DEBUG: Using language from Accept-Language header: {base_lang}")
                    return base_lang
        
        print("DEBUG: No supported language found, defaulting to 'en'")
        return 'en'

    def _update_cv_data(self, instance, data, current_lang):
        """Update CV and translation data with AI correction and translation"""
        # Update CV fields
        if 'current_step' in data:
            instance.current_step = data['current_step']
            instance.save()

        # Get or create current translation
        current_translation = CVTranslation.objects.get_or_create(
            cv=instance,
            language_code=current_lang
        )[0]

        # Fields to check for changes
        fields_to_check = ['languages', 'personal_info', 'education', 'experience', 'skills', 'certificates']
        
        # Track changes
        modified_fields = {}
        has_changes = False

        # Check which fields have changed
        for field in fields_to_check:
            if field in data:
                current_value = getattr(current_translation, field)
                new_value = data[field]
                
                # Compare as JSON strings
                current_json = json.dumps(current_value, sort_keys=True)
                new_json = json.dumps(new_value, sort_keys=True)
                
                if current_json != new_json:
                    has_changes = True
                    modified_fields[field] = new_value
                    # Update current translation
                    setattr(current_translation, field, new_value)
        
        if not has_changes:
            current_translation.save()
            return current_translation

        # Save current translation first
        current_translation.save()

        # Prepare all text content for translation in a single batch
        texts_to_translate = {}
        for field, new_value in modified_fields.items():
            text_fields = self._get_text_fields_for_type(field)
            
            if isinstance(new_value, list):
                for idx, item in enumerate(new_value):
                    for text_field in text_fields:
                        if text_field in item and item[text_field]:
                            key = f"{field}.{idx}.{text_field}"
                            texts_to_translate[key] = item[text_field]
            else:
                for text_field in text_fields:
                    if text_field in new_value and new_value[text_field]:
                        key = f"{field}.{text_field}"
                        texts_to_translate[key] = new_value[text_field]

        # Initialize OpenAI client
        client = openai.OpenAI()

        # First, correct the text in current language
        if texts_to_translate:
            current_lang_name = self.SUPPORTED_LANGUAGES[current_lang]
            prompt = f"""Please check and correct the following {current_lang_name} texts for grammar and clarity.
            Return ONLY a JSON object with the same keys and corrected values.
            Input JSON:
            {json.dumps(texts_to_translate, indent=2, ensure_ascii=False)}
            """
            
            try:
                response = client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are a professional editor. Always respond with valid JSON only."},
                        {"role": "user", "content": prompt}
                    ]
                )
                
                # Extract JSON from response
                try:
                    response_text = response.choices[0].message.content.strip()
                    json_start = response_text.find('{')
                    json_end = response_text.rfind('}') + 1
                    if json_start >= 0 and json_end > json_start:
                        json_str = response_text[json_start:json_end]
                        corrected_texts = json.loads(json_str)
                        
                        # Apply corrections back to the current translation
                        for key, corrected_text in corrected_texts.items():
                            field, *parts = key.split('.')
                            field_value = getattr(current_translation, field)
                            
                            if len(parts) == 2:  # List item
                                idx, text_field = parts
                                field_value[int(idx)][text_field] = corrected_text
                            else:  # Direct field
                                text_field = parts[0]
                                field_value[text_field] = corrected_text
                            
                            setattr(current_translation, field, field_value)
                            # Update texts_to_translate with corrected version
                            texts_to_translate[key] = corrected_text
                        
                    current_translation.save()
                    
                except (json.JSONDecodeError, ValueError) as e:
                    print(f"JSON parsing error for correction: {str(e)}")
                    print(f"Response was: {response_text}")
                    
            except Exception as e:
                print(f"Correction error: {str(e)}")

        # Then translate to other languages
        for lang_code, lang_name in self.SUPPORTED_LANGUAGES.items():
            if lang_code == current_lang:
                continue

            # Get or create translation for this language
            translation = CVTranslation.objects.get_or_create(
                cv=instance,
                language_code=lang_code
            )[0]

            # Copy structure from current translation
            for field in modified_fields:
                current_value = getattr(current_translation, field)
                setattr(translation, field, current_value)

            # If there are texts to translate
            if texts_to_translate:
                # Make a single API call for all texts in this language
                prompt = f"""Please translate the following texts from {self.SUPPORTED_LANGUAGES[current_lang]} to {lang_name}.
                Return ONLY a JSON object with the same keys and translated values.
                Input JSON:
                {json.dumps(texts_to_translate, indent=2, ensure_ascii=False)}
                """
                
                try:
                    response = client.chat.completions.create(
                        model="gpt-4",
                        messages=[
                            {"role": "system", "content": "You are a professional translator. Always respond with valid JSON only."},
                            {"role": "user", "content": prompt}
                        ]
                    )
                    
                    # Extract JSON from response
                    try:
                        response_text = response.choices[0].message.content.strip()
                        json_start = response_text.find('{')
                        json_end = response_text.rfind('}') + 1
                        if json_start >= 0 and json_end > json_start:
                            json_str = response_text[json_start:json_end]
                            translations = json.loads(json_str)
                            
                            # Apply translations back to the fields
                            for key, translated_text in translations.items():
                                field, *parts = key.split('.')
                                field_value = getattr(translation, field)
                                
                                if len(parts) == 2:  # List item
                                    idx, text_field = parts
                                    field_value[int(idx)][text_field] = translated_text
                                else:  # Direct field
                                    text_field = parts[0]
                                    field_value[text_field] = translated_text
                                
                                setattr(translation, field, field_value)
                            
                    except (json.JSONDecodeError, ValueError) as e:
                        print(f"JSON parsing error for {lang_code}: {str(e)}")
                        print(f"Response was: {response_text}")
                        
                except Exception as e:
                    print(f"Translation error for {lang_code}: {str(e)}")

                translation.save()

        return current_translation

class CVListCreateView(generics.ListCreateAPIView):
    serializer_class = CVSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CV.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CVDetailView(CVBaseMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CVSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return CV.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Get language code from Accept-Language header
        lang_code = self._get_language_code(request)
        print(f"Requested language code: {lang_code}")  # Debug log
        
        try:
            # Try to get existing translation
            translation = CVTranslation.objects.get(
                cv=instance,
                language_code=lang_code
            )
            print(f"Found existing translation for {lang_code}")  # Debug log
            
            # Check if content language matches requested language
            content_fields = ['personal_info', 'education', 'experience', 'skills', 'languages', 'certificates']
            needs_retranslation = False
            
            # Simple language detection based on common words
            language_markers = {
                'es': ['desarrollador', 'empresa', 'descripción', 'experiencia', 'educación'],
                'en': ['developer', 'company', 'description', 'experience', 'education'],
                'tr': ['geliştirici', 'şirket', 'açıklama', 'deneyim', 'eğitim']
            }
            
            # Check content language
            for field in content_fields:
                content = str(getattr(translation, field)).lower()
                if content:
                    # Check if content contains markers from other languages
                    for lang, markers in language_markers.items():
                        if lang != lang_code:  # Skip current language markers
                            if any(marker in content for marker in markers):
                                print(f"Found {lang} content in {field} for {lang_code} translation")
                                needs_retranslation = True
                                break
                    if needs_retranslation:
                        break
            
            if needs_retranslation:
                print(f"Content language mismatch detected, retranslating to {lang_code}")
                
                # Get English translation as source
                try:
                    source_translation = CVTranslation.objects.get(cv=instance, language_code='en')
                except CVTranslation.DoesNotExist:
                    source_translation = translation  # Fallback to current translation
                
                # Prepare data for translation
                cv_data = {
                    'personal_info': source_translation.personal_info,
                    'education': source_translation.education,
                    'experience': source_translation.experience,
                    'skills': source_translation.skills,
                    'languages': source_translation.languages,
                    'certificates': source_translation.certificates,
                    
                }
                
                # Translate content for all languages
                translation_service = TranslationService()
                all_translations = translation_service.translate_cv_content_all_languages(cv_data)
                
                # Update all translations
                for lang_code, translated_content in all_translations.items():
                    try:
                        trans, _ = CVTranslation.objects.get_or_create(
                            cv=instance,
                            language_code=lang_code
                        )
                        trans.update_content(translated_content)
                        if lang_code == lang_code:  # Current language
                            translation = trans
                    except Exception as e:
                        print(f"Error updating translation for {lang_code}: {str(e)}")
            
        except CVTranslation.DoesNotExist:
            print(f"No translation found for {lang_code}, creating new one")  # Debug log
            
            # Get English translation as source if available
            try:
                source_translation = CVTranslation.objects.get(cv=instance, language_code='en')
                cv_data = {
                    'personal_info': source_translation.personal_info,
                    'education': source_translation.education,
                    'experience': source_translation.experience,
                    'skills': source_translation.skills,
                    'languages': source_translation.languages,
                    'certificates': source_translation.certificates,
                }
            except CVTranslation.DoesNotExist:
                cv_data = {
                    'personal_info': instance.personal_info,
                    'education': instance.education,
                    'experience': instance.experience,
                    'skills': instance.skills,
                    'languages': instance.languages,
                    'certificates': instance.certificates,
                }
            
            # Translate content for all languages
            translation_service = TranslationService()
            all_translations = translation_service.translate_cv_content_all_languages(cv_data)
            
            # Create all translations
            for code, content in all_translations.items():
                try:
                    trans = CVTranslation.objects.create(
                        cv=instance,
                        language_code=code,
                        personal_info=content.get('personal_info', {}),
                        education=content.get('education', []),
                        experience=content.get('experience', []),
                        skills=content.get('skills', []),
                        languages=content.get('languages', []),
                        certificates=content.get('certificates', [])
                    )
                    if code == lang_code:  # Current language
                        translation = trans
                except Exception as e:
                    print(f"Error creating translation for {code}: {str(e)}")
                    if code == lang_code:  # Current language
                        translation = CVTranslation.objects.create(
                            cv=instance,
                            language_code=code,
                            personal_info=cv_data['personal_info'],
                            education=cv_data['education'],
                            experience=cv_data['experience'],
                            skills=cv_data['skills'],
                            languages=cv_data['languages'],
                            certificates=cv_data['certificates']
                        )
        
        # Return the data in the requested language
        return Response(self._get_translated_data(instance, lang_code))

    def update(self, request, *args, **kwargs):
        print("="*50)
        print("UPDATE METODU ÇAĞRILDI")
        print("REQUEST METHOD:", request.method)
        print("REQUEST DATA:", request.data)
        print("="*50)
        
        instance = self.get_object()
        current_lang = self._get_language_code(request)
        
        self._update_cv_data(instance, request.data, current_lang)
        return Response(self._get_translated_data(instance, current_lang))

    def patch(self, request, *args, **kwargs):
        print("="*50)
        print("PATCH METODU ÇAĞRILDI")
        print("REQUEST DATA:", request.data)
        print("="*50)
        return self.update(request, *args, **kwargs)

    def _translate_modified_fields(self, instance, current_lang, modified_fields):
        """Helper method to translate modified fields to other languages"""
        client = openai.OpenAI()
        
        for lang_code, lang_name in self.SUPPORTED_LANGUAGES.items():
            if lang_code != current_lang:
                try:
                    trans, _ = CVTranslation.objects.get_or_create(
                        cv=instance,
                        language_code=lang_code
                    )
                    
                    for field, value in modified_fields.items():
                        prompt = f"""Please translate the following {field} content to {lang_name}. 
                        Keep the JSON structure exactly the same, only translate the text content.
                        
                        Content to translate:
                        {json.dumps(value, ensure_ascii=False)}
                        """
                        
                        try:
                            response = client.chat.completions.create(
                                model="gpt-4",
                                messages=[
                                    {"role": "system", "content": "You are a professional translator."},
                                    {"role": "user", "content": prompt}
                                ],
                                response_format={"type": "json_object"}
                            )
                            
                            translated_content = json.loads(response.choices[0].message.content)
                            setattr(trans, field, translated_content)
                            
                        except Exception as e:
                            print(f"Error translating {field} for {lang_code}: {str(e)}")
                            setattr(trans, field, value)
                    
                    trans.save()
                    
                except Exception as e:
                    print(f"Error handling translation for {lang_code}: {str(e)}")

class CVViewSet(CVBaseMixin, viewsets.ModelViewSet):
    queryset = CV.objects.all()
    serializer_class = CVSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return CV.objects.prefetch_related('translations').filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        print("="*50)
        print("UPDATE METODU ÇAĞRILDI")
        print("REQUEST METHOD:", request.method)
        print("REQUEST DATA:", request.data)
        print("="*50)
        
        instance = self.get_object()
        current_lang = self._get_language_code(request)
        
        self._update_cv_data(instance, request.data, current_lang)
        return Response(self._get_translated_data(instance, current_lang))

    def create(self, request, *args, **kwargs):
        # Gelen veriyi al
        data = request.data.copy()
        
        # Eğer title yoksa varsayılan değer ata
        if not data.get('title'):
            data['title'] = 'Untitled CV'
        
        data['status'] = 'draft'
        data['current_step'] = 0
        
        # CV'yi oluştur
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save(user=self.request.user)
        
        # CV verilerini hazırla
        cv_data = {
            'personal_info': instance.personal_info,
            'education': instance.education,
            'experience': instance.experience,
            'skills': instance.skills,
            'languages': instance.languages,
        }

        # Sertifikaları ayrıca hazırla
        certificates = []
        for cert in instance.certificates.all():
            cert_data = {
                'id': cert.id,
                'name': cert.name,
                'issuer': cert.issuer,
                'date': cert.date.isoformat() if cert.date else None,
                'description': cert.description,
                'document': cert.document.url if cert.document else None,
                'document_type': cert.document_type,
            }
            certificates.append(cert_data)
        cv_data['certificates'] = certificates

        try:
            # OpenAI client'ı oluştur
            client = openai.OpenAI()
            
            # Her dil için çevirileri yap
            all_translations = {}
            for lang_code in self.SUPPORTED_LANGUAGES.keys():
                if lang_code == 'en':  # İngilizce için çeviri yapma
                    continue
                    
                translated_content = {}
                
                # Sertifikalar dışındaki alanları normal çeviri servisi ile çevir
                translation_service = TranslationService()
                for field in ['personal_info', 'education', 'experience', 'skills', 'languages']:
                    if field in cv_data:
                        translated_content[field] = translation_service.translate_content(cv_data[field], lang_code)
                
                # Sertifikaları OpenAI ile çevir
                if certificates:
                    translated_certificates = []
                    for cert in certificates:
                        prompt = f"""Please translate the following certificate information to {self.SUPPORTED_LANGUAGES[lang_code]}:
                        
                        Certificate Name: {cert.get('name', '')}
                        Issuer: {cert.get('issuer', '')}
                        Description: {cert.get('description', '')}
                        
                        Return the translation in JSON format:
                        {{
                            "name": "translated name",
                            "issuer": "translated issuer",
                            "description": "translated description"
                        }}
                        """
                        
                        try:
                            response = client.chat.completions.create(
                                model="gpt-4",
                                messages=[
                                    {"role": "system", "content": "You are a professional translator."},
                                    {"role": "user", "content": prompt}
                                ],
                                response_format={"type": "json_object"}
                            )
                            
                            translated_data = json.loads(response.choices[0].message.content)
                            translated_cert = cert.copy()
                            translated_cert.update({
                                'name': translated_data.get('name', cert.get('name', '')),
                                'issuer': translated_data.get('issuer', cert.get('issuer', '')),
                                'description': translated_data.get('description', cert.get('description', ''))
                            })
                            translated_certificates.append(translated_cert)
                            
                        except Exception as e:
                            print(f"Error translating certificate: {str(e)}")
                            translated_certificates.append(cert)
                    
                    translated_content['certificates'] = translated_certificates
                
                all_translations[lang_code] = translated_content
            
            # Her dil için çevirileri kaydet
            for lang_code, translated_content in all_translations.items():
                try:
                    # Çeviriyi kaydet
                    translation = CVTranslation.objects.create(
                        cv=instance,
                        language_code=lang_code,
                        personal_info=translated_content.get('personal_info', {}),
                        education=translated_content.get('education', []),
                        experience=translated_content.get('experience', []),
                        skills=translated_content.get('skills', []),
                        languages=translated_content.get('languages', [])
                    )
                    
                    # Sertifikaları ayrıca güncelle
                    if 'certificates' in translated_content:
                        for cert_data in translated_content['certificates']:
                            cert_id = cert_data.get('id')
                            if cert_id:
                                cert = instance.certificates.filter(id=cert_id).first()
                                if cert:
                                    cert.name = cert_data.get('name', cert.name)
                                    cert.issuer = cert_data.get('issuer', cert.issuer)
                                    cert.description = cert_data.get('description', cert.description)
                                    cert.save()
                    
                except Exception as e:
                    print(f"Error saving translation for {lang_code}: {str(e)}")
                    # Hata durumunda orijinal içerikle kaydet
                    CVTranslation.objects.create(
                        cv=instance,
                        language_code=lang_code,
                        personal_info=cv_data['personal_info'],
                        education=cv_data['education'],
                        experience=cv_data['experience'],
                        skills=cv_data['skills'],
                        languages=cv_data['languages']
                    )
                    
        except Exception as e:
            print(f"Error in create method translations: {str(e)}")
            # Hata durumunda tüm diller için orijinal içerikle kaydet
            for lang_code in self.SUPPORTED_LANGUAGES.keys():
                if lang_code != 'en':  # İngilizce için kaydetme
                    CVTranslation.objects.create(
                        cv=instance,
                        language_code=lang_code,
                        personal_info=cv_data['personal_info'],
                        education=cv_data['education'],
                        experience=cv_data['experience'],
                        skills=cv_data['skills'],
                        languages=cv_data['languages']
                    )
        
        # Güncel veriyi dön
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def create_translations_for_all_languages(self, cv_instance):
        """Tüm desteklenen diller için çevirileri oluşturur"""
        try:
            # CV verilerini hazırla
            cv_data = {}
            content_fields = ['personal_info', 'education', 'experience', 'skills', 'languages', 'certificates']
            
            for field in content_fields:
                if hasattr(cv_instance, field):
                    if field == 'certificates':
                        # Sertifikaları özel olarak işle
                        certificates = []
                        for cert in cv_instance.certificates.all():
                            cert_data = {
                                'id': cert.id,
                                'name': cert.name,
                                'issuer': cert.issuer,
                                'date': cert.date.isoformat() if cert.date else None,
                                'description': cert.description,
                                'document': cert.document.url if cert.document else None,
                                'document_type': cert.document_type,
                            }
                            certificates.append(cert_data)
                        cv_data[field] = certificates
                    else:
                        cv_data[field] = getattr(cv_instance, field)

            # OpenAI için client oluştur
            client = openai.OpenAI()
            
            # Her dil için çevirileri yap
            all_translations = {}
            for lang_code in self.SUPPORTED_LANGUAGES.keys():
                translated_content = {}
                
                for field, value in cv_data.items():
                    if field == 'certificates':
                        # Sertifikaları OpenAI ile çevir
                        translated_certificates = []
                        for cert in value:
                            prompt = f"""Please translate the following certificate information to {self.SUPPORTED_LANGUAGES[lang_code]}:
                            
                            Certificate Name: {cert.get('name', '')}
                            Issuer: {cert.get('issuer', '')}
                            Description: {cert.get('description', '')}
                            
                            Return the translation in JSON format:
                            {{
                                "name": "translated name",
                                "issuer": "translated issuer",
                                "description": "translated description"
                            }}
                            """
                            
                            try:
                                response = client.chat.completions.create(
                                    model="gpt-4",
                                    messages=[
                                        {"role": "system", "content": "You are a professional translator."},
                                        {"role": "user", "content": prompt}
                                    ],
                                    response_format={"type": "json_object"}
                                )
                                
                                translated_data = json.loads(response.choices[0].message.content)
                                translated_cert = cert.copy()
                                translated_cert.update({
                                    'name': translated_data.get('name', cert.get('name', '')),
                                    'issuer': translated_data.get('issuer', cert.get('issuer', '')),
                                    'description': translated_data.get('description', cert.get('description', ''))
                                })
                                translated_certificates.append(translated_cert)
                                
                            except Exception as e:
                                print(f"Error translating certificate: {str(e)}")
                                translated_certificates.append(cert)
                        
                        translated_content[field] = translated_certificates
                    else:
                        # Diğer alanlar için normal çeviri servisi
                        translation_service = TranslationService()
                        translated_content[field] = translation_service.translate_content(value, lang_code)
                
                all_translations[lang_code] = translated_content
            
            # Her dil için çevirileri kaydet
            for lang_code, translated_content in all_translations.items():
                try:
                    # Çeviriyi kaydet veya güncelle
                    translation, _ = CVTranslation.objects.get_or_create(
                        cv=cv_instance,
                        language_code=lang_code
                    )
                    
                    # Sadece çevrilen alanları güncelle
                    for field, value in translated_content.items():
                        if field in cv_data:
                            if field == 'certificates':
                                # Sertifika çevirilerini özel olarak işle
                                for cert_data in value:
                                    cert_id = cert_data.get('id')
                                    if cert_id:
                                        # Mevcut sertifikayı güncelle
                                        cert = cv_instance.certificates.filter(id=cert_id).first()
                                        if cert:
                                            cert.name = cert_data.get('name', cert.name)
                                            cert.issuer = cert_data.get('issuer', cert.issuer)
                                            cert.description = cert_data.get('description', cert.description)
                                            cert.save()
                            else:
                                setattr(translation, field, value)
                    
                    translation.save()
                    
                except Exception as e:
                    print(f"Error saving translation for {lang_code}: {str(e)}")
                    # Hata durumunda orijinal içerikle kaydet
                    translation, _ = CVTranslation.objects.get_or_create(
                        cv=cv_instance,
                        language_code=lang_code,
                        defaults=cv_data
                    )
                    
        except Exception as e:
            print(f"Error in create_translations_for_all_languages: {str(e)}")
            # Hata durumunda tüm diller için orijinal içerikle kaydet
            for lang_code in self.SUPPORTED_LANGUAGES.keys():
                CVTranslation.objects.get_or_create(
                    cv=cv_instance,
                    language_code=lang_code,
                    defaults=cv_data
                )

    @action(detail=True, methods=['post'])
    def update_step(self, request, pk=None):
        cv = self.get_object()
        step = request.data.get('current_step')
        
        if step is not None:
            cv.current_step = step
            cv.save()
            serializer = self.get_serializer(cv)
            return Response(serializer.data)
        
        return Response(
            {'error': 'current_step is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'], url_path='generate-web')
    def generate_web(self, request, pk=None):
        try:
            cv = self.get_object()
            template_id = request.data.get('template_id')
            
            # Get current language
            current_lang = self._get_language_code(request)
            translation = cv.translations.filter(language_code=current_lang).first()
            
            # Template path'i düzelt
            template_path = f'web/{template_id}.html'
            
            # Context hazırla
            context = {
                'personal_info': translation.personal_info if translation else cv.personal_info,
                'experience': translation.experience if translation else cv.experience,
                'education': translation.education if translation else cv.education,
                'skills': translation.skills if translation else cv.skills,
                'languages': translation.languages if translation else cv.languages,
                'certificates': translation.certificates if translation else [],
                'video_url': cv.video.url if cv.video else None,
                'video_description': cv.video_description
            }
            
            try:
                # HTML oluştur
                html_content = render_to_string(template_path, context)
            except TemplateDoesNotExist:
                return Response(
                    {'error': f'Template not found: {template_path}'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # HTML dosyasını kaydet
            filename = f'cv_{cv.id}_{template_id}.html'
            filepath = os.path.join(settings.MEDIA_ROOT, 'cv_web', filename)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            with open(filepath, 'w') as f:
                f.write(html_content)
            
            web_url = f'{settings.MEDIA_URL}cv_web/{filename}'
            
            return Response({'web_url': web_url})
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'], url_path='generate-pdf')
    def generate_pdf(self, request, pk=None):
        try:
            cv = self.get_object()
            template_id = request.data.get('template_id')
            
            # Get current language
            current_lang = self._get_language_code(request)
            translation = cv.translations.filter(language_code=current_lang).first()
            
            # Template seç
            template_path = f'templates/pdf/{template_id}.html'
            
            # Context hazırla
            context = {
                'personal_info': translation.personal_info if translation else cv.personal_info,
                'experience': translation.experience if translation else cv.experience,
                'education': translation.education if translation else cv.education,
                'skills': translation.skills if translation else cv.skills,
                'languages': translation.languages if translation else cv.languages,
                'certificates': translation.certificates if translation else []
            }
            
            # HTML oluştur
            html_content = render_to_string(template_path, context)
            
            # PDF oluştur
            options = {
                'page-size': 'A4',
                'margin-top': '0.75in',
                'margin-right': '0.75in',
                'margin-bottom': '0.75in',
                'margin-left': '0.75in',
                'encoding': "UTF-8",
            }
            
            # PDF'i kaydet
            filename = f'cv_{cv.id}_{template_id}.pdf'
            filepath = os.path.join(settings.MEDIA_ROOT, 'cv_pdf', filename)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            pdfkit.from_string(html_content, filepath, options=options)
            
            pdf_url = f'{settings.MEDIA_URL}cv_pdf/{filename}'
            
            return Response({'pdf_url': pdf_url})
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def upload_certificate(self, request, pk=None):
        try:
            cv = self.get_object()
            file = request.FILES.get('file')
            
            if not file:
                return Response(
                    {'error': 'No file provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Generate a unique ID for the certificate
            certificate_id = str(uuid.uuid4())

            # Save the file
            file_path = f'certificates/{cv.id}/{certificate_id}/{file.name}'
            storage = default_storage
            if storage.exists(file_path):
                storage.delete(file_path)
            
            file_path = storage.save(file_path, file)
            file_url = storage.url(file_path)

            # Determine file type
            file_name = file.name.lower()
            if file_name.endswith('.pdf'):
                document_type = 'pdf'
            elif any(file_name.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif']):
                document_type = 'image'
            else:
                return Response(
                    {'error': 'Invalid file type. Only PDF and images are allowed.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                # Use OpenAI to extract certificate details
                client = openai.OpenAI()
                
                prompt = """Please analyze this certificate information and extract the following details in JSON format:
                {
                    "name": "certificate name/title",
                    "issuer": "issuing organization/institution",
                    "description": "brief description of the certificate (max 100 words)"
                }
                
                Certificate text:
                """
                
                response = client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant that extracts certificate information."},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                
                # Parse the response
                certificate_info = json.loads(response.choices[0].message.content)
                
                # Create certificate data
                certificate_data = {
                    'id': certificate_id,
                    'name': certificate_info.get('name', 'Untitled Certificate'),
                    'issuer': certificate_info.get('issuer', 'Unknown Issuer'),
                    'description': certificate_info.get('description', ''),
                    'date': timezone.now().date().isoformat(),
                    'document_url': file_url,
                    'document_type': document_type
                }
                
            except Exception as e:
                print(f"Error extracting certificate details: {str(e)}")
                # If OpenAI extraction fails, use default values
                certificate_data = {
                    'id': certificate_id,
                    'name': 'Untitled Certificate',
                    'issuer': 'Unknown Issuer',
                    'description': '',
                    'date': timezone.now().date().isoformat(),
                    'document_url': file_url,
                    'document_type': document_type
                }

            # Update all translations with the new certificate
            current_lang = self._get_language_code(request)
            for translation in cv.translations.all():
                certificates = translation.certificates or []
                certificates.append(certificate_data.copy())
                translation.certificates = certificates
                translation.save()
            
            # Return the updated CV data
            return Response(self._get_translated_data(cv, current_lang))
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['POST'], url_path='upload-video')
    def upload_video(self, request, pk=None):
        try:
            cv = self.get_object()
            
            if 'video' in request.FILES:
                # Eski videoyu sil
                if cv.video:
                    cv.video.delete()
                
                cv.video = request.FILES['video']
            
            cv.video_description = request.data.get('video_description', '')
            cv.save()
            
            # Tüm CV verilerini serialize edip dön
            serializer = self.get_serializer(cv)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'], url_path='translate')
    def translate(self, request, pk=None):
        try:
            cv = self.get_object()
            target_language = request.data.get('language')
            
            if not target_language:
                return Response(
                    {'error': 'Target language is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # CV verilerini hazırla
            cv_data = {
                'personal_info': cv.personal_info,
                'education': cv.education,
                'experience': cv.experience,
                'skills': cv.skills,
                'languages': cv.languages,
                'certificates': [
                    {
                        'id': cert.id,
                        'name': cert.name,
                        'issuer': cert.issuer,
                        'date': cert.date,
                        'description': cert.description,
                        'document': cert.document.url if cert.document else None,
                        'document_type': cert.document_type,
                    } for cert in cv.certificates.all()
                ],
            }
            
            # Çeviri servisini başlat
            translation_service = TranslationService()
            
            # Çeviriyi yap
            translated_content = translation_service.translate_cv_content(cv_data, target_language)
            
            # Çeviriyi kaydet
            translation, created = CVTranslation.objects.update_or_create(
                cv=cv,
                language_id=request.data.get('language_id'),
                defaults={'content': translated_content}
            )
            
            serializer = CVTranslationSerializer(translation)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['POST'], url_path='upload-certificate-document')
    def upload_certificate_document(self, request, pk=None):
        try:
            cv = self.get_object()
            file = request.FILES.get('file')
            certificate_id = request.data.get('certificate_id')
            
            if not file or not certificate_id:
                return Response(
                    {'error': 'Both file and certificate_id are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Dosya tipini belirle
            file_name = file.name.lower()
            if file_name.endswith('.pdf'):
                document_type = 'pdf'
            elif any(file_name.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif']):
                document_type = 'image'
            else:
                return Response(
                    {'error': 'Invalid file type. Only PDF and images are allowed.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Dosyayı kaydet
            file_path = f'certificates/{cv.id}/{certificate_id}/{file.name}'
            storage = default_storage
            if storage.exists(file_path):
                storage.delete(file_path)
            
            file_path = storage.save(file_path, file)
            file_url = storage.url(file_path)

            # Sertifika bilgilerini güncelle
            current_lang = self._get_language_code(request)
            translation = cv.translations.filter(language_code=current_lang).first()
            
            if translation:
                certificates = translation.certificates
                for cert in certificates:
                    if str(cert.get('id')) == str(certificate_id):
                        cert['document_url'] = file_url
                        cert['document_type'] = document_type
                        break
                
                translation.certificates = certificates
                translation.save()
            
            return Response({
                'document_url': file_url,
                'document_type': document_type
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['POST'], url_path='delete-certificate-document')
    def delete_certificate_document(self, request, pk=None):
        try:
            cv = self.get_object()
            certificate_id = request.data.get('certificate_id')
            
            if not certificate_id:
                return Response(
                    {'error': 'certificate_id is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Tüm dillerdeki çevirilerde sertifika dosyasını sil
            for translation in cv.translations.all():
                certificates = translation.certificates
                for cert in certificates:
                    if str(cert.get('id')) == str(certificate_id):
                        # Dosyayı fiziksel olarak sil
                        document_url = cert.get('document_url')
                        if document_url:
                            file_path = document_url.replace(settings.MEDIA_URL, '')
                            storage = default_storage
                            if storage.exists(file_path):
                                storage.delete(file_path)
                        
                        # Dosya bilgilerini temizle
                        cert['document_url'] = None
                        cert['document_type'] = None
                        break
                
                translation.certificates = certificates
                translation.save()
            
            return Response({'status': 'success'})
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['GET'])
def debug_auth(request):
    return Response({
        'user': str(request.user),
        'auth': str(request.auth),
        'headers': dict(request.headers)
    }, status=status.HTTP_200_OK) 