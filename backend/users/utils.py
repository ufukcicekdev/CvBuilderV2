import json
import requests
from typing import Union, List
from django.conf import settings

def send_email_via_smtp2go(
    to_list: Union[List[str], str],
    subject: str,
    html_body: str,
    text_body: str = None
) -> dict:
    """
    SMTP2GO API kullanarak email gönderir
    
    Args:
        to_list: Tek bir email adresi string olarak veya email adresleri listesi
        subject: Email konusu
        html_body: HTML formatında email içeriği
        text_body: Düz metin formatında email içeriği (opsiyonel)
    
    Returns:
        dict: API yanıtı
    """
    url = "https://api.smtp2go.com/v3/email/send"
    
    headers = {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': settings.SMTP2GO_API_KEY,
        'Accept': 'application/json'
    }
    
    # to_list'i her zaman liste formatına çevir
    if isinstance(to_list, str):
        to_list = [to_list]
    
    payload = {
        "sender": settings.SMTP2GO_FROM_EMAIL,
        "to": to_list,
        "subject": subject,
        "html_body": html_body
    }
    
    # Eğer düz metin body varsa ekle
    if text_body:
        payload["text_body"] = text_body
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()  # 4xx, 5xx hataları için exception fırlat
        return response.json()
    except requests.exceptions.RequestException as e:
        # Hata durumunda loglama yapabilir veya exception fırlatabilirsiniz
        raise Exception(f"Email gönderilemedi: {str(e)}") 