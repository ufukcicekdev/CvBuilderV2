'use client';

import React from 'react';
import Image from 'next/image';
import { PDFTemplateProps } from './types';
import { useTheme } from '@mui/material/styles';

// Represent a section in the template
export interface TemplateSection {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  order: number;
  settings: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
    borderColor?: string;
    displayStyle?: 'list' | 'grid' | 'timeline';
    ratingStyle?: 'dots' | 'stars' | 'bars' | 'numbers';
  };
}

export interface CustomTemplateData {
  id: string;
  name: string;
  type: 'web' | 'pdf';
  createdAt: string;
  updatedAt: string;
  globalSettings: GlobalSettings;
  sections: TemplateSection[];
}

export type GlobalSettings = {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  showPhoto: boolean;
  photoStyle: 'circle' | 'square' | 'rounded';
  photoSize: number;
  layout: 'single' | 'double' | 'sidebar-left' | 'sidebar-right' | 'three-column' | 'header-highlight';
  isAtsOptimized?: boolean;
  sidebarColor?: string;
};

interface CustomTemplateRendererProps extends PDFTemplateProps {
  templateData: CustomTemplateData;
  onSaveTemplate?: (template: CustomTemplateData) => Promise<any>;
}

/**
 * CustomTemplateRenderer - Özel şablonları kullanıcı verisiyle birlikte işler
 * Bu bileşen, TemplateBuilder'da oluşturulan şablonları alır ve kullanıcı verileriyle doldurur
 */
const CustomTemplateRenderer: React.FC<CustomTemplateRendererProps> = ({ 
  data, 
  language = 'en', 
  translations = {},
  templateData,
  onSaveTemplate
}) => {
  const theme = useTheme();

  // Varsayılan templateData değerlerini ayarla
  templateData = {
    ...templateData,
    globalSettings: {
      ...templateData.globalSettings,
      layout: templateData.globalSettings.layout || 'single',
      textColor: templateData.globalSettings.textColor || '#000000',
      backgroundColor: templateData.globalSettings.backgroundColor || '#ffffff',
      fontFamily: templateData.globalSettings.fontFamily || 'Arial, sans-serif',
      fontSize: templateData.globalSettings.fontSize || 12
    }
  };

  // RTL desteği (Arapça gibi sağdan sola yazılan diller için)
  const isRTL = language === 'ar';
  
  // Log to debug template data
  console.log('Rendering template with data:', templateData);
  
  // Görünür ve sıralanmış bölümleri al
  const visibleSections = templateData.sections
    .filter(section => section.visible)
    .sort((a, b) => a.order - b.order)
    .map(section => {
      // Dile göre bölüm başlıklarını güncelle
      let updatedTitle = section.title;
      
      // Bölüm tipine göre başlık çevirisini ayarla
      if (translations) {
        switch (section.type) {
          case 'summary':
            updatedTitle = translations.summary || data.i18n?.professionalSummary || 'Professional Summary';
            break;
          case 'experience':
            updatedTitle = translations.experience || data.i18n?.experience || 'Experience';
            break;
          case 'education':
            updatedTitle = translations.education || data.i18n?.education || 'Education';
            break;
          case 'skills':
            updatedTitle = translations.skills || data.i18n?.skills || 'Skills';
            break;
          case 'languages':
            updatedTitle = translations.languages || data.i18n?.languages || 'Languages';
            break;
          case 'certificates':
            updatedTitle = translations.certificates || data.i18n?.certificates || 'Certificates';
            break;
          default:
            // Değişiklik yapma
            break;
        }
      }
      
      return {
        ...section,
        title: updatedTitle
      };
    });
  
  // Şablon dış konteynırı için stilleri ayarla
  const getMainLayoutStyle = () => {
    // Seçilen layout değeri için tutarlı bir yaklaşım
    const layout = templateData.globalSettings.layout || 'single';
    console.log('CustomTemplateRenderer: Uygulanan layout değeri:', layout);
    
    // Temele stil özellikleri
    const baseStyles = {
      boxSizing: 'border-box' as const,
      backgroundColor: templateData.globalSettings.backgroundColor || '#ffffff',
      fontFamily: templateData.globalSettings.fontFamily,
      fontSize: `${templateData.globalSettings.fontSize}pt`,
      color: templateData.globalSettings.textColor || '#000000',
      direction: isRTL ? 'rtl' as const : 'ltr' as const,
      textAlign: isRTL ? 'right' as const : 'left' as const,
    };
    
    // PDF için özel stiller
    if (templateData.type === 'pdf') {
      console.log('PDF için tam sayfa stil uygulanıyor, layout:', layout);
      
      // Tüm layout tipleri için stiller
      if (layout === 'single') {
        return {
          ...baseStyles,
          padding: '0',
          margin: '0',
          width: '100%',
          height: '100%',
          display: 'block',
        };
      } else if (layout === 'double') {
        return {
          ...baseStyles,
          padding: '0',
          margin: '0',
          width: '100%',
          height: '100%',
          display: 'block',
        };
      } else if (layout === 'three-column') {
        return {
          ...baseStyles,
          padding: '0',
          margin: '0',
          width: '100%',
          height: '100%',
          display: 'block',
        };
      } else if (layout === 'sidebar-left') {
        return {
          ...baseStyles,
          padding: '0',
          margin: '0',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column' as const, // Önce header sonra içerik
        };
      } else if (layout === 'sidebar-right') {
        return {
          ...baseStyles,
          padding: '0',
          margin: '0',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column' as const, // Önce header sonra içerik
        };
      } else if (layout === 'header-highlight') {
        return {
          ...baseStyles,
          padding: '0',
          margin: '0',
          width: '100%',
          height: '100%',
          display: 'block',
        };
      }
      
      // Varsayılan (single)
      return {
        ...baseStyles,
        padding: '0',
        margin: '0',
        width: '100%',
        height: '100%',
        display: 'block',
      };
    }
    
    // Web için özel stiller (normal şablon görünümü için)
    if (layout === 'single') {
      return {
        ...baseStyles,
        padding: theme.spacing(2),
        margin: '0 auto',
        width: '100%',
        maxWidth: '100%',
        display: 'block',
      };
    } else if (layout === 'double') {
      return {
        ...baseStyles,
        padding: theme.spacing(2),
        margin: '0 auto',
        width: '100%',
        maxWidth: '100%',
        display: 'block',
      };
    } else if (layout === 'three-column') {
      return {
        ...baseStyles,
        padding: theme.spacing(2),
        margin: '0 auto',
        width: '100%',
        maxWidth: '100%',
        display: 'block',
      };
    } else if (layout === 'sidebar-left') {
      return {
        ...baseStyles,
        padding: theme.spacing(2),
        margin: '0 auto',
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column' as const, // Önce header sonra içerik
      };
    } else if (layout === 'sidebar-right') {
      return {
        ...baseStyles,
        padding: theme.spacing(2),
        margin: '0 auto',
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column' as const, // Önce header sonra içerik
      };
    } else if (layout === 'header-highlight') {
      return {
        ...baseStyles,
        padding: theme.spacing(2),
        margin: '0 auto',
        width: '100%',
        maxWidth: '100%',
        display: 'block',
      };
    }
    
    // Varsayılan (single)
    return {
      ...baseStyles,
      padding: theme.spacing(2),
      margin: '0 auto',
      width: '100%',
      maxWidth: '100%',
      display: 'block',
    };
  };
  
  // Sidebar stilini ayarla - PDF ve normal görünüm için
  const getSidebarStyle = () => {
    // Template türü PDF ise kenar boşluğu ve padding olmadan
    if (templateData.type === 'pdf') {
      return {
        width: templateData.globalSettings.layout === 'single' ? '100%' : '30%',
        backgroundColor: templateData.globalSettings.sidebarColor || theme.palette.primary.main,
        color: '#ffffff',
        padding: '0',
        margin: '0',
        boxSizing: 'border-box' as const,
        overflow: 'hidden' as const
      };
    }
    
    // Normal şablon görünümü için
    return {
      width: templateData.globalSettings.layout === 'single' ? '100%' : '30%',
      backgroundColor: templateData.globalSettings.sidebarColor || theme.palette.primary.main,
      color: '#ffffff',
      padding: theme.spacing(2),
      boxSizing: 'border-box' as const
    };
  };
  
  // Ana içerik stilini ayarla - PDF ve normal görünüm için
  const getMainContentStyle = () => {
    // Template türü PDF ise kenar boşluğu ve padding olmadan
    if (templateData.type === 'pdf') {
      return {
        width: templateData.globalSettings.layout === 'single' ? '100%' : '70%',
        padding: '0',
        margin: '0',
        boxSizing: 'border-box' as const,
        overflow: 'hidden' as const
      };
    }
    
    // Normal şablon görünümü için
    return {
      width: templateData.globalSettings.layout === 'single' ? '100%' : '70%',
      padding: theme.spacing(2),
      boxSizing: 'border-box' as const
    };
  };
  
  // Header section render
  const renderHeader = () => {
    const headerSection = visibleSections.find(s => s.id === 'header');
    if (!headerSection) return null;

    // Email ve telefon göstergelerini ayarla
    const hasContactInfo = data && data.personal_info && (data.personal_info.email || data.personal_info.phone);
    
    // Layout tipine göre header arka plan rengini ayarla
    const headerBackgroundColor = 
      headerSection.settings.backgroundColor || 
      (templateData.globalSettings.layout === 'header-highlight' || 
       templateData.globalSettings.layout === 'sidebar-left' || 
       templateData.globalSettings.layout === 'sidebar-right' 
        ? templateData.globalSettings.primaryColor 
        : '#ffffff');
    
    console.log('Header rendering with background color:', headerBackgroundColor, 'Layout:', templateData.globalSettings.layout);
    
    return (
      <div className={`cv-section cv-header ${templateData.globalSettings.layout === 'header-highlight' ? 'header-highlight' : ''}`} 
        style={{
          backgroundColor: headerBackgroundColor,
          color: headerSection.settings.textColor || '#ffffff',
          padding: templateData.globalSettings.layout === 'header-highlight' ? '25px 15px' : '15px',
          marginBottom: '15px',
          borderRadius: '3px',
          position: 'relative',
          display: 'flex',
          flexDirection: (templateData.globalSettings.layout === 'double' || 
                         templateData.globalSettings.layout === 'sidebar-left' || 
                         templateData.globalSettings.layout === 'sidebar-right') ? 'row' : 'column',
          alignItems: templateData.globalSettings.layout === 'header-highlight' ? 'center' : 'flex-start',
          textAlign: templateData.globalSettings.layout === 'header-highlight' ? 'center' : 'left',
          ...(templateData.globalSettings.layout === 'header-highlight' && {
            borderBottom: `5px solid ${templateData.globalSettings.primaryColor}`,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          })
        }}
      >
        {templateData.globalSettings.showPhoto && (
          <div className="cv-photo" style={{
            width: `${templateData.globalSettings.photoSize}px`,
            height: `${templateData.globalSettings.photoSize}px`,
            backgroundColor: '#e0e0e0',
            backgroundImage: data && data.personal_info && data.personal_info.photo ? `url(${data.personal_info.photo})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: templateData.globalSettings.photoStyle === 'circle' ? '50%' : 
                           templateData.globalSettings.photoStyle === 'rounded' ? '10px' : '0',
            marginRight: ['double', 'sidebar-left', 'sidebar-right'].includes(templateData.globalSettings.layout) ? '20px' : '0',
            marginBottom: ['single', 'three-column', 'header-highlight'].includes(templateData.globalSettings.layout) ? '10px' : '0',
            flexShrink: 0,
            ...(templateData.globalSettings.layout === 'header-highlight' && {
              margin: '0 auto 15px auto',
              border: `3px solid ${templateData.globalSettings.secondaryColor || '#ffffff'}`
            })
          }}>
            {!data || !data.personal_info || !data.personal_info.photo && (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#9e9e9e'
              }}>
                <span style={{ fontSize: '13px' }}>Photo</span>
              </div>
            )}
          </div>
        )}
        
        <div style={{ 
          flex: 1,
          textAlign: templateData.globalSettings.layout === 'header-highlight' ? 'center' : 'left'
        }}>
          <h1 style={{ 
            margin: '0 0 5px 0', 
            color: headerSection.settings.textColor || '#ffffff',
            fontSize: `${headerSection.settings.fontSize || 16}pt`,
            fontWeight: templateData.globalSettings.layout === 'header-highlight' ? 'bold' : 'normal'
          }}>
            {data && data.personal_info && data.personal_info.full_name || 'Full Name'}
          </h1>
          
          <p style={{ 
            margin: '0 0 5px 0',
            color: headerSection.settings.textColor || '#ffffff',
            fontSize: `${(headerSection.settings.fontSize || 16) * 0.75}pt`,
            opacity: 0.9
          }}>
            {data && data.personal_info && data.personal_info.title || 'Profession / Title'}
          </p>
          
          {hasContactInfo && (
            <div style={{
              display: 'flex',
              flexDirection: templateData.globalSettings.layout === 'header-highlight' ? 'column' : 'row',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: '8px',
              justifyContent: templateData.globalSettings.layout === 'header-highlight' ? 'center' : 'flex-start',
              alignItems: templateData.globalSettings.layout === 'header-highlight' ? 'center' : 'flex-start',
              color: headerSection.settings.textColor || '#ffffff',
              fontSize: `${(headerSection.settings.fontSize || 16) * 0.65}pt`,
            }}>
              {data && data.personal_info && data.personal_info.email && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  opacity: 0.85
                }}>
                  <span>📧</span> {data.personal_info.email}
                </div>
              )}
              
              {data && data.personal_info && data.personal_info.phone && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  opacity: 0.85
                }}>
                  <span>📱</span> {data.personal_info.phone}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Özet bölümü
  const renderSummarySection = (section: TemplateSection) => (
    <>
      {data.personal_info?.summary && (
        <div>
          <p style={{ 
            margin: 0, 
            textAlign: 'justify', 
            fontSize: `${section.settings.fontSize || templateData.globalSettings.fontSize}pt`,
            color: section.settings.textColor
          }}>
            {data.personal_info.summary}
          </p>
        </div>
      )}
    </>
  );
  
  // Deneyim bölümü
  const renderExperienceSection = (section: TemplateSection) => (
    <>
      {data.experience && data.experience.length > 0 && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '6px'
        }}>
          {data.experience.map((exp, index) => (
            <div key={index} style={{ 
              display: section.settings.displayStyle === 'timeline' ? 'flex' : 'block',
              borderLeft: section.settings.displayStyle === 'timeline' ? `2px solid ${templateData.globalSettings.primaryColor}` : 'none',
              paddingLeft: section.settings.displayStyle === 'timeline' ? '10px' : '0',
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  margin: '0 0 2px 0', 
                  fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) + 1}pt`,
                  color: section.settings.textColor
                }}>
                  {exp.position}
                </h3>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) - 1}pt`,
                  color: section.settings.textColor
                }}>
                  <span>{exp.company}{exp.location ? `, ${exp.location}` : ''}</span>
                  <span style={{ color: templateData.globalSettings.secondaryColor }}>
                    {exp.start_date} - {exp.end_date || translations.present || 'Present'}
                  </span>
                </div>
                <p style={{ 
                  margin: '2px 0 0 0', 
                  fontSize: `${section.settings.fontSize || templateData.globalSettings.fontSize}pt`,
                  color: section.settings.textColor,
                  textAlign: 'justify'
                }}>
                  {exp.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
  
  // Eğitim bölümü
  const renderEducationSection = (section: TemplateSection) => (
    <>
      {data.education && data.education.length > 0 && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '6px'
        }}>
          {data.education.map((edu, index) => (
            <div key={index} style={{ 
              display: section.settings.displayStyle === 'timeline' ? 'flex' : 'block',
              borderLeft: section.settings.displayStyle === 'timeline' ? `2px solid ${templateData.globalSettings.primaryColor}` : 'none',
              paddingLeft: section.settings.displayStyle === 'timeline' ? '10px' : '0',
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  margin: '0 0 2px 0', 
                  fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) + 1}pt`,
                  color: section.settings.textColor
                }}>
                  {edu.degree}
                </h3>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) - 1}pt`,
                  color: section.settings.textColor
                }}>
                  <span>{edu.school}{edu.location ? `, ${edu.location}` : ''}</span>
                  <span style={{ color: templateData.globalSettings.secondaryColor }}>
                    {edu.start_date} - {edu.end_date || translations.present || 'Present'}
                  </span>
                </div>
                <p style={{ 
                  margin: '2px 0 0 0', 
                  fontSize: `${section.settings.fontSize || templateData.globalSettings.fontSize}pt`,
                  color: section.settings.textColor,
                  textAlign: 'justify'
                }}>
                  {edu.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
  
  // Beceriler bölümü
  const renderSkillsSection = (section: TemplateSection) => (
    <>
      {data.skills && data.skills.length > 0 && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '4px'
        }}>
          {data.skills.map((skill, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: `${section.settings.fontSize || templateData.globalSettings.fontSize}pt`,
              color: section.settings.textColor
            }}>
              <span>{skill.name}</span>
              {skill.level && (
                <span>
                  {renderRating(skill.level, section.settings.ratingStyle)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
  
  // Diller bölümü
  const renderLanguagesSection = (section: TemplateSection) => (
    <>
      {data.languages && data.languages.length > 0 && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '4px'
        }}>
          {data.languages.map((lang, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: `${section.settings.fontSize || templateData.globalSettings.fontSize}pt`,
              color: section.settings.textColor
            }}>
              <span>{lang.name}</span>
              {lang.level && (
                <span>
                  {renderRating(lang.level, section.settings.ratingStyle)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
  
  // Sertifikalar bölümü
  const renderCertificatesSection = (section: TemplateSection) => (
    <>
      {data.certificates && data.certificates.length > 0 && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '4px'
        }}>
          {data.certificates.map((cert, index) => (
            <div key={index} style={{ 
              fontSize: `${section.settings.fontSize || templateData.globalSettings.fontSize}pt`,
              color: section.settings.textColor
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between'
              }}>
                <span style={{ fontWeight: 'bold' }}>{cert.name}</span>
                {cert.date && (
                  <span style={{ color: templateData.globalSettings.secondaryColor }}>
                    {cert.date}
                  </span>
                )}
              </div>
              <div>
                {cert.issuer}
                {cert.description ? ` - ${cert.description}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
  
  // Beceri ve dil seviyelerini göstermek için farklı stilleri render et
  const renderRating = (level: number, style: string = 'dots') => {
    switch (style) {
      case 'stars':
        return (
          <>
            {Array.from({ length: level }).map((_, i) => (
              <span key={i} style={{ color: templateData.globalSettings.primaryColor, marginLeft: '1px' }}>★</span>
            ))}
            {Array.from({ length: 5 - level }).map((_, i) => (
              <span key={i} style={{ color: '#eee', marginLeft: '1px' }}>★</span>
            ))}
          </>
        );
      case 'bars':
        return (
          <div style={{ 
            width: '100px', 
            height: '8px', 
            backgroundColor: '#eee', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div 
              style={{ 
                width: `${level * 20}%`, 
                height: '100%', 
                backgroundColor: templateData.globalSettings.primaryColor 
              }} 
            />
          </div>
        );
      case 'numbers':
        return (
          <span>{level}/5</span>
        );
      case 'dots':
      default:
        return (
          <>
            {Array.from({ length: level }).map((_, i) => (
              <span key={i} style={{ color: templateData.globalSettings.primaryColor, marginLeft: '1px' }}>●</span>
            ))}
            {Array.from({ length: 5 - level }).map((_, i) => (
              <span key={i} style={{ color: '#eee', marginLeft: '1px' }}>●</span>
            ))}
          </>
        );
    }
  };
  
  // Bölüm içeriğini render et
  const renderSectionContent = (section: TemplateSection) => {
    const { type } = section;
    
    switch (type) {
      case 'header':
        return renderHeader();
      case 'summary':
        return renderSummarySection(section);
      case 'experience':
        return renderExperienceSection(section);
      case 'education':
        return renderEducationSection(section);
      case 'skills':
        return renderSkillsSection(section);
      case 'languages':
        return renderLanguagesSection(section);
      case 'certificates':
        return renderCertificatesSection(section);
      default:
        return null;
    }
  };

  return (
    <div style={getMainLayoutStyle()}>
      {/* Layout tipine göre içerik yapısını değiştir */}
      {templateData.globalSettings.layout === 'three-column' ? (
        <>
          {/* Header Bölümü */}
          {visibleSections.find(section => section.id === 'header')?.visible && (
            <section style={{
              backgroundColor: visibleSections.find(section => section.id === 'header')?.settings.backgroundColor || templateData.globalSettings.primaryColor,
              color: '#ffffff',
              padding: '15px',
              marginBottom: '15px',
              borderRadius: '4px'
            }}>
              {renderSectionContent(visibleSections.find(section => section.id === 'header')!)}
            </section>
          )}
          
          {/* Üç Sütunlu İçerik Bölümü */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr', 
            gap: '15px', 
            width: '100%' 
          }}>
            {/* Birinci Sütun */}
            <div className="column-1">
              {visibleSections
                .filter(section => section.id !== 'header' && ['skills', 'languages'].includes(section.type))
                .map((section) => (
                  <section key={section.id} style={{
                    marginBottom: '15px',
                    backgroundColor: section.settings.backgroundColor || '#ffffff',
                    padding: '15px',
                    borderRadius: '4px'
                  }}>
                    <h2 style={{
                      margin: '0 0 10px 0',
                      fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) + 2}pt`,
                      color: section.settings.textColor || templateData.globalSettings.textColor,
                      borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                      paddingBottom: '8px'
                    }}>
                      {section.title}
                    </h2>
                    {renderSectionContent(section)}
                  </section>
                ))}
            </div>
            
            {/* İkinci Sütun */}
            <div className="column-2">
              {visibleSections
                .filter(section => section.id !== 'header' && ['summary', 'experience'].includes(section.type))
                .map((section) => (
                  <section key={section.id} style={{
                    marginBottom: '15px',
                    backgroundColor: section.settings.backgroundColor || '#ffffff',
                    padding: '15px',
                    borderRadius: '4px'
                  }}>
                    <h2 style={{
                      margin: '0 0 10px 0',
                      fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) + 2}pt`,
                      color: section.settings.textColor || templateData.globalSettings.textColor,
                      borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                      paddingBottom: '8px'
                    }}>
                      {section.title}
                    </h2>
                    {renderSectionContent(section)}
                  </section>
                ))}
            </div>
            
            {/* Üçüncü Sütun */}
            <div className="column-3">
              {visibleSections
                .filter(section => section.id !== 'header' && ['education', 'certificates'].includes(section.type))
                .map((section) => (
                  <section key={section.id} style={{
                    marginBottom: '15px',
                    backgroundColor: section.settings.backgroundColor || '#ffffff',
                    padding: '15px',
                    borderRadius: '4px'
                  }}>
                    <h2 style={{
                      margin: '0 0 10px 0',
                      fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) + 2}pt`,
                      color: section.settings.textColor || templateData.globalSettings.textColor,
                      borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                      paddingBottom: '8px'
                    }}>
                      {section.title}
                    </h2>
                    {renderSectionContent(section)}
                  </section>
                ))}
            </div>
          </div>
        </>
      ) : templateData.globalSettings.layout === 'single' ? (
        // Tek sütun layout
        <>
          {/* Header özel bir bölüm, önce onu render et */}
          {visibleSections.find(section => section.type === 'header') && (
            <section style={{
              width: '100%',
              marginBottom: '20px',
              backgroundColor: visibleSections.find(section => section.type === 'header')?.settings.backgroundColor || '#ffffff',
              padding: '15px',
              borderRadius: '4px'
            }}>
              <h2 style={{
                margin: '0 0 15px 0',
                fontSize: `${(visibleSections.find(section => section.type === 'header')?.settings.fontSize || templateData.globalSettings.fontSize) + 2}pt`,
                color: visibleSections.find(section => section.type === 'header')?.settings.textColor || templateData.globalSettings.textColor,
                borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                paddingBottom: '8px'
              }}>
                {visibleSections.find(section => section.type === 'header')?.title}
              </h2>
              {renderSectionContent(visibleSections.find(section => section.type === 'header')!)}
            </section>
          )}

          {/* Diğer bölümleri sırayla render et */}
          {visibleSections
            .filter(section => section.type !== 'header')
            .map((section) => (
              <section key={section.id} style={{
                width: '100%',
                marginBottom: '20px',
                backgroundColor: section.settings.backgroundColor || '#ffffff',
                padding: '15px',
                borderRadius: '4px'
              }}>
                <h2 style={{
                  margin: '0 0 15px 0',
                  fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) + 2}pt`,
                  color: section.settings.textColor || templateData.globalSettings.textColor,
                  borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                  paddingBottom: '8px'
                }}>
                  {section.title}
                </h2>
                {renderSectionContent(section)}
              </section>
            ))}
        </>
      ) : templateData.globalSettings.layout === 'double' ? (
        // İki sütunlu düzen
        <>
          {/* Header özel bir bölüm, önce onu render et */}
          {visibleSections.find(section => section.type === 'header') && (
            <section style={{
              width: '100%',
              marginBottom: '20px',
              backgroundColor: visibleSections.find(section => section.type === 'header')?.settings.backgroundColor || '#ffffff',
              padding: '15px',
              borderRadius: '4px'
            }}>
              {renderSectionContent(visibleSections.find(section => section.type === 'header')!)}
            </section>
          )}
          
          {/* İki sütunlu içerik bölümü */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px', 
            width: '100%' 
          }}>
            {/* Sol sütun */}
            <div className="column-left">
              {visibleSections
                .filter(section => section.id !== 'header')
                .slice(0, Math.ceil(visibleSections.filter(s => s.id !== 'header').length / 2))
                .map((section) => (
                  <section key={section.id} style={{
                    marginBottom: '15px',
                    backgroundColor: section.settings.backgroundColor || '#ffffff',
                    padding: '15px',
                    borderRadius: '4px'
                  }}>
                    <h2 style={{
                      margin: '0 0 10px 0',
                      fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) + 2}pt`,
                      color: section.settings.textColor || templateData.globalSettings.textColor,
                      borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                      paddingBottom: '8px'
                    }}>
                      {section.title}
                    </h2>
                    {renderSectionContent(section)}
                  </section>
                ))}
            </div>
            
            {/* Sağ sütun */}
            <div className="column-right">
              {visibleSections
                .filter(section => section.id !== 'header')
                .slice(Math.ceil(visibleSections.filter(s => s.id !== 'header').length / 2))
                .map((section) => (
                  <section key={section.id} style={{
                    marginBottom: '15px',
                    backgroundColor: section.settings.backgroundColor || '#ffffff',
                    padding: '15px',
                    borderRadius: '4px'
                  }}>
                    <h2 style={{
                      margin: '0 0 10px 0',
                      fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) + 2}pt`,
                      color: section.settings.textColor || templateData.globalSettings.textColor,
                      borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                      paddingBottom: '8px'
                    }}>
                      {section.title}
                    </h2>
                    {renderSectionContent(section)}
                  </section>
                ))}
            </div>
          </div>
        </>
      ) : templateData.globalSettings.layout === 'sidebar-left' || templateData.globalSettings.layout === 'sidebar-right' ? (
        // Kenar çubuklu düzenler (sol veya sağ)
        <>
          {/* Header özel bir bölüm, önce onu render et */}
          {visibleSections.find(section => section.type === 'header') && (
            <section style={{
              width: '100%',
              marginBottom: '20px',
              backgroundColor: templateData.globalSettings.primaryColor,
              padding: '15px',
              borderRadius: '4px'
            }}>
              {renderSectionContent(visibleSections.find(section => section.type === 'header')!)}
            </section>
          )}
          
          {/* Sidebarı ve Ana içeriği render et */}
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            width: '100%',
            flexDirection: templateData.globalSettings.layout === 'sidebar-left' ? 'row' : 'row-reverse'
          }}>
            {/* Sidebar */}
            <div style={{
              width: '30%',
              backgroundColor: templateData.globalSettings.sidebarColor || '#f5f5f5',
              padding: '15px',
              borderRadius: '4px'
            }}>
              {visibleSections
                .filter(section => section.id !== 'header' && ['skills', 'languages', 'certificates'].includes(section.type))
                .map((section) => (
                  <section key={section.id} style={{
                    marginBottom: '15px',
                    backgroundColor: 'transparent',
                    padding: '10px',
                    borderRadius: '4px'
                  }}>
                    <h2 style={{
                      margin: '0 0 10px 0',
                      fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) + 2}pt`,
                      color: section.settings.textColor || templateData.globalSettings.textColor,
                      borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                      paddingBottom: '8px'
                    }}>
                      {section.title}
                    </h2>
                    {renderSectionContent(section)}
                  </section>
                ))}
            </div>
            
            {/* Ana içerik */}
            <div style={{ flex: 1 }}>
              {visibleSections
                .filter(section => section.id !== 'header' && ['summary', 'experience', 'education'].includes(section.type))
                .map((section) => (
                  <section key={section.id} style={{
                    marginBottom: '15px',
                    backgroundColor: section.settings.backgroundColor || '#ffffff',
                    padding: '15px',
                    borderRadius: '4px'
                  }}>
                    <h2 style={{
                      margin: '0 0 10px 0',
                      fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) + 2}pt`,
                      color: section.settings.textColor || templateData.globalSettings.textColor,
                      borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                      paddingBottom: '8px'
                    }}>
                      {section.title}
                    </h2>
                    {renderSectionContent(section)}
                  </section>
                ))}
            </div>
          </div>
        </>
      ) : templateData.globalSettings.layout === 'header-highlight' ? (
        // Öne çıkan başlıklı düzen
        <>
          {/* Öne çıkan başlık bölümü */}
          {visibleSections.find(section => section.type === 'header') && (
            <section style={{
              width: '100%',
              marginBottom: '25px',
              backgroundColor: templateData.globalSettings.primaryColor || '#2196f3',
              color: '#ffffff',
              padding: '25px 15px',
              borderRadius: '4px',
              textAlign: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
            }}>
              {renderSectionContent(visibleSections.find(section => section.type === 'header')!)}
            </section>
          )}

          {/* Ana bölümler */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px', 
            width: '100%' 
          }}>
            {/* Birinci sütun - Deneyim ve Eğitim */}
            <div className="main-content-left">
              {visibleSections
                .filter(section => section.type !== 'header' && ['summary', 'experience', 'education'].includes(section.type))
                .map((section) => (
                  <section key={section.id} style={{
                    marginBottom: '20px',
                    backgroundColor: section.settings.backgroundColor || '#ffffff',
                    padding: '15px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                  }}>
                    <h2 style={{
                      margin: '0 0 15px 0',
                      fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) + 2}pt`,
                      color: section.settings.textColor || templateData.globalSettings.primaryColor,
                      borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                      paddingBottom: '8px'
                    }}>
                      {section.title}
                    </h2>
                    {renderSectionContent(section)}
                  </section>
                ))}
            </div>
            
            {/* İkinci sütun - Yetenekler, Diller ve Sertifikalar */}
            <div className="main-content-right">
              {visibleSections
                .filter(section => section.type !== 'header' && ['skills', 'languages', 'certificates'].includes(section.type))
                .map((section) => (
                  <section key={section.id} style={{
                    marginBottom: '20px',
                    backgroundColor: section.settings.backgroundColor || '#ffffff',
                    padding: '15px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                  }}>
                    <h2 style={{
                      margin: '0 0 15px 0',
                      fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) + 2}pt`,
                      color: section.settings.textColor || templateData.globalSettings.primaryColor,
                      borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                      paddingBottom: '8px'
                    }}>
                      {section.title}
                    </h2>
                    {renderSectionContent(section)}
                  </section>
                ))}
            </div>
          </div>
        </>
      ) : (
        // Varsayılan tek sütunlu düzen (fallback)
        <>
          {/* Header özel bir bölüm, önce onu render et */}
          {visibleSections.find(section => section.type === 'header') && (
            <section style={{
              width: '100%',
              marginBottom: '20px',
              backgroundColor: visibleSections.find(section => section.type === 'header')?.settings.backgroundColor || '#ffffff',
              padding: '15px',
              borderRadius: '4px'
            }}>
              {renderSectionContent(visibleSections.find(section => section.type === 'header')!)}
            </section>
          )}
          
          {/* Diğer bölümleri sırayla render et */}
          {visibleSections
            .filter(section => section.type !== 'header')
            .map((section) => (
              <section key={section.id} style={{
                width: '100%',
                marginBottom: '20px',
                backgroundColor: section.settings.backgroundColor || '#ffffff',
                padding: '15px',
                borderRadius: '4px'
              }}>
                <h2 style={{
                  margin: '0 0 15px 0',
                  fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) + 2}pt`,
                  color: section.settings.textColor || templateData.globalSettings.textColor,
                  borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                  paddingBottom: '8px'
                }}>
                  {section.title}
                </h2>
                {renderSectionContent(section)}
              </section>
            ))}
        </>
      )}
    </div>
  );
};

export default CustomTemplateRenderer;
