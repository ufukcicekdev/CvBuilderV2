'use client';

import React from 'react';
import Image from 'next/image';
import { PDFTemplateProps } from './types';

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
  showPhoto: boolean;
  photoStyle: 'circle' | 'square' | 'rounded';
  photoSize: number;
  layout: 'single' | 'double' | 'sidebar-left' | 'sidebar-right' | 'three-column' | 'header-highlight';
};

interface CustomTemplateRendererProps extends PDFTemplateProps {
  templateData: CustomTemplateData;
}

/**
 * CustomTemplateRenderer - Özel şablonları kullanıcı verisiyle birlikte işler
 * Bu bileşen, TemplateBuilder'da oluşturulan şablonları alır ve kullanıcı verileriyle doldurur
 */
const CustomTemplateRenderer: React.FC<CustomTemplateRendererProps> = ({ 
  data, 
  language = 'en', 
  translations = {},
  templateData 
}) => {
  // RTL desteği (Arapça gibi sağdan sola yazılan diller için)
  const isRTL = language === 'ar';
  
  // Görünür ve sıralanmış bölümleri al
  const visibleSections = templateData.sections
    .filter(section => section.visible)
    .sort((a, b) => a.order - b.order);
  
  // Bölüm içeriğini render et
  const renderSectionContent = (section: TemplateSection) => {
    const { type } = section;
    
    switch (type) {
      case 'header':
        return renderHeaderSection(section);
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
  
  // Başlık bölümü
  const renderHeaderSection = (section: TemplateSection) => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      flexDirection: ['single', 'three-column', 'header-highlight'].includes(templateData.globalSettings.layout) ? 'column' : 'row',
      ...(templateData.globalSettings.layout === 'header-highlight' && {
        textAlign: 'center',
        borderBottom: `5px solid ${templateData.globalSettings.primaryColor}`,
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        padding: '15px',
        backgroundColor: section.settings.backgroundColor || '#f5f5f5',
        marginBottom: '20px'
      })
    }}>
      <div style={{ 
        textAlign: ['single', 'three-column', 'header-highlight'].includes(templateData.globalSettings.layout) ? 'center' : 'left',
        marginBottom: ['single', 'three-column', 'header-highlight'].includes(templateData.globalSettings.layout) ? '10px' : '0'
      }}>
        <h1 style={{ 
          margin: '0 0 5px 0', 
          fontSize: `${section.settings.fontSize || templateData.globalSettings.fontSize + 6}pt`,
          color: section.settings.textColor,
          ...(templateData.globalSettings.layout === 'header-highlight' && {
            marginBottom: '10px',
            borderBottom: `2px solid ${templateData.globalSettings.secondaryColor}`,
            paddingBottom: '5px',
            display: 'inline-block'
          })
        }}>
          {data.personal_info?.first_name} {data.personal_info?.last_name}
        </h1>
        {data.personal_info?.title && (
          <p style={{ 
            margin: '0 0 5px 0', 
            fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) - 1}pt`,
            color: section.settings.textColor,
            ...(templateData.globalSettings.layout === 'header-highlight' && {
              fontStyle: 'italic'
            })
          }}>
            {data.personal_info.title}
          </p>
        )}
        <div style={{ 
          display: 'flex', 
          flexDirection: ['single', 'three-column', 'header-highlight'].includes(templateData.globalSettings.layout) ? 'row' : 'column',
          flexWrap: 'wrap', 
          gap: '8px', 
          fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) - 2}pt`,
          color: section.settings.textColor,
          justifyContent: ['single', 'three-column', 'header-highlight'].includes(templateData.globalSettings.layout) ? 'center' : 'flex-start'
        }}>
          {data.personal_info?.email && (
            <span>📧 {data.personal_info.email}</span>
          )}
          {data.personal_info?.phone && (
            <span>📱 {data.personal_info.phone}</span>
          )}
          {data.personal_info?.location && (
            <span>📍 {data.personal_info.location}</span>
          )}
        </div>
      </div>
      
      {/* Profil fotoğrafı */}
      {templateData.globalSettings.showPhoto && data.personal_info?.photo && (
        <div style={{
          ...(templateData.globalSettings.layout === 'header-highlight' && {
            margin: '0 auto 10px auto',
            border: `3px solid ${templateData.globalSettings.secondaryColor}`
          })
        }}>
          <Image
            src={data.personal_info.photo}
            alt="Profile"
            width={templateData.globalSettings.photoSize}
            height={templateData.globalSettings.photoSize}
            style={{
              borderRadius: templateData.globalSettings.photoStyle === 'circle' 
                ? '50%' 
                : templateData.globalSettings.photoStyle === 'rounded' 
                  ? '10px' 
                  : '0',
              objectFit: 'cover'
            }}
          />
        </div>
      )}
    </div>
  );
  
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
  
  // Render main template based on layout type
  return (
    <div style={{ 
      fontFamily: templateData.globalSettings.fontFamily || 'Arial, sans-serif',
      fontSize: `${templateData.globalSettings.fontSize}pt`,
      backgroundColor: templateData.globalSettings.backgroundColor,
      color: '#333333',
      padding: '20px',
      width: '100%',
      boxSizing: 'border-box',
      direction: isRTL ? 'rtl' : 'ltr',
    }}>
      {/* Use different layouts based on layout setting */}
      {templateData.globalSettings.layout === 'single' && (
        // Single column layout
        <div>
          {visibleSections.map(section => (
            <div 
              key={section.id}
              style={{ 
                marginBottom: '20px',
                backgroundColor: section.settings.backgroundColor,
                padding: '10px',
                borderRadius: '4px',
              }}
            >
              {/* Section title except for header section */}
              {section.type !== 'header' && (
                <h2 style={{ 
                  borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                  paddingBottom: '5px',
                  marginTop: 0,
                  color: templateData.globalSettings.primaryColor
                }}>
                  {section.title}
                </h2>
              )}
              {renderSectionContent(section)}
            </div>
          ))}
        </div>
      )}

      {templateData.globalSettings.layout === 'double' && (
        // Double column layout
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Left column (narrower) */}
          <div style={{ flex: '0.35' }}>
            {visibleSections
              .filter(section => ['header', 'summary', 'skills', 'languages'].includes(section.type))
              .map(section => (
                <div 
                  key={section.id}
                  style={{ 
                    marginBottom: '20px',
                    backgroundColor: section.settings.backgroundColor,
                    padding: '10px',
                    borderRadius: '4px',
                  }}
                >
                  {/* Section title except for header section */}
                  {section.type !== 'header' && (
                    <h2 style={{ 
                      borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                      paddingBottom: '5px',
                      marginTop: 0,
                      color: templateData.globalSettings.primaryColor
                    }}>
                      {section.title}
                    </h2>
                  )}
                  {renderSectionContent(section)}
                </div>
              ))}
          </div>
          
          {/* Right column (wider) */}
          <div style={{ flex: '0.65' }}>
            {visibleSections
              .filter(section => ['experience', 'education', 'certificates'].includes(section.type))
              .map(section => (
                <div 
                  key={section.id}
                  style={{ 
                    marginBottom: '20px',
                    backgroundColor: section.settings.backgroundColor,
                    padding: '10px',
                    borderRadius: '4px',
                  }}
                >
                  <h2 style={{ 
                    borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                    paddingBottom: '5px',
                    marginTop: 0,
                    color: templateData.globalSettings.primaryColor
                  }}>
                    {section.title}
                  </h2>
                  {renderSectionContent(section)}
                </div>
              ))}
          </div>
        </div>
      )}

      {templateData.globalSettings.layout === 'sidebar-left' && (
        // Left sidebar layout
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Left sidebar */}
          <div style={{ width: '30%', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
            {visibleSections
              .filter(section => ['skills', 'languages', 'certificates'].includes(section.type))
              .map(section => (
                <div 
                  key={section.id}
                  style={{ 
                    marginBottom: '20px',
                    backgroundColor: section.settings.backgroundColor,
                    padding: '10px',
                    borderRadius: '4px',
                  }}
                >
                  <h2 style={{ 
                    borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                    paddingBottom: '5px',
                    marginTop: 0,
                    fontSize: `${templateData.globalSettings.fontSize + 2}pt`,
                    color: templateData.globalSettings.primaryColor
                  }}>
                    {section.title}
                  </h2>
                  {renderSectionContent(section)}
                </div>
              ))}
          </div>
          
          {/* Main content */}
          <div style={{ flex: '1' }}>
            {visibleSections
              .filter(section => ['header', 'summary', 'experience', 'education'].includes(section.type))
              .map(section => (
                <div 
                  key={section.id}
                  style={{ 
                    marginBottom: '20px',
                    backgroundColor: section.settings.backgroundColor,
                    padding: '10px',
                    borderRadius: '4px',
                  }}
                >
                  {/* Section title except for header section */}
                  {section.type !== 'header' && (
                    <h2 style={{ 
                      borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                      paddingBottom: '5px',
                      marginTop: 0,
                      color: templateData.globalSettings.primaryColor
                    }}>
                      {section.title}
                    </h2>
                  )}
                  {renderSectionContent(section)}
                </div>
              ))}
          </div>
        </div>
      )}

      {templateData.globalSettings.layout === 'sidebar-right' && (
        // Right sidebar layout
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Main content */}
          <div style={{ flex: '1' }}>
            {visibleSections
              .filter(section => ['header', 'summary', 'experience', 'education'].includes(section.type))
              .map(section => (
                <div 
                  key={section.id}
                  style={{ 
                    marginBottom: '20px',
                    backgroundColor: section.settings.backgroundColor,
                    padding: '10px',
                    borderRadius: '4px',
                  }}
                >
                  {/* Section title except for header section */}
                  {section.type !== 'header' && (
                    <h2 style={{ 
                      borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                      paddingBottom: '5px',
                      marginTop: 0,
                      color: templateData.globalSettings.primaryColor
                    }}>
                      {section.title}
                    </h2>
                  )}
                  {renderSectionContent(section)}
                </div>
              ))}
          </div>
          
          {/* Right sidebar */}
          <div style={{ width: '30%', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
            {visibleSections
              .filter(section => ['skills', 'languages', 'certificates'].includes(section.type))
              .map(section => (
                <div 
                  key={section.id}
                  style={{ 
                    marginBottom: '20px',
                    backgroundColor: section.settings.backgroundColor,
                    padding: '10px',
                    borderRadius: '4px',
                  }}
                >
                  <h2 style={{ 
                    borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                    paddingBottom: '5px',
                    marginTop: 0,
                    fontSize: `${templateData.globalSettings.fontSize + 2}pt`,
                    color: templateData.globalSettings.primaryColor
                  }}>
                    {section.title}
                  </h2>
                  {renderSectionContent(section)}
                </div>
              ))}
          </div>
        </div>
      )}

      {templateData.globalSettings.layout === 'three-column' && (
        // Three column layout
        <div style={{ display: 'flex', gap: '15px' }}>
          {/* Column 1 - Skills */}
          <div style={{ flex: '1' }}>
            {visibleSections
              .filter(section => ['skills'].includes(section.type))
              .map(section => (
                <div 
                  key={section.id}
                  style={{ 
                    marginBottom: '20px',
                    backgroundColor: section.settings.backgroundColor,
                    padding: '10px',
                    borderRadius: '4px',
                  }}
                >
                  <h2 style={{ 
                    borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                    paddingBottom: '5px',
                    marginTop: 0,
                    fontSize: `${templateData.globalSettings.fontSize + 2}pt`,
                    color: templateData.globalSettings.primaryColor
                  }}>
                    {section.title}
                  </h2>
                  {renderSectionContent(section)}
                </div>
              ))}
          </div>
          
          {/* Column 2 - Summary & Experience */}
          <div style={{ flex: '1' }}>
            {visibleSections
              .filter(section => ['header', 'summary', 'experience'].includes(section.type))
              .map(section => (
                <div 
                  key={section.id}
                  style={{ 
                    marginBottom: '20px',
                    backgroundColor: section.settings.backgroundColor,
                    padding: '10px',
                    borderRadius: '4px',
                  }}
                >
                  {/* Section title except for header section */}
                  {section.type !== 'header' && (
                    <h2 style={{ 
                      borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                      paddingBottom: '5px',
                      marginTop: 0,
                      color: templateData.globalSettings.primaryColor
                    }}>
                      {section.title}
                    </h2>
                  )}
                  {renderSectionContent(section)}
                </div>
              ))}
          </div>
          
          {/* Column 3 - Education, Languages, Certificates */}
          <div style={{ flex: '1' }}>
            {visibleSections
              .filter(section => ['education', 'languages', 'certificates'].includes(section.type))
              .map(section => (
                <div 
                  key={section.id}
                  style={{ 
                    marginBottom: '20px',
                    backgroundColor: section.settings.backgroundColor,
                    padding: '10px',
                    borderRadius: '4px',
                  }}
                >
                  <h2 style={{ 
                    borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                    paddingBottom: '5px',
                    marginTop: 0,
                    fontSize: `${templateData.globalSettings.fontSize + 2}pt`,
                    color: templateData.globalSettings.primaryColor
                  }}>
                    {section.title}
                  </h2>
                  {renderSectionContent(section)}
                </div>
              ))}
          </div>
        </div>
      )}

      {templateData.globalSettings.layout === 'header-highlight' && (
        // Header highlight layout with special header and 2-column content
        <div>
          {/* Header section first */}
          {visibleSections
            .filter(section => section.type === 'header')
            .map(section => (
              <div 
                key={section.id}
                style={{ 
                  marginBottom: '20px',
                  backgroundColor: section.settings.backgroundColor,
                  padding: '15px',
                  borderRadius: '4px',
                  textAlign: 'center',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  borderBottom: `5px solid ${templateData.globalSettings.primaryColor}`
                }}
              >
                {renderSectionContent(section)}
              </div>
            ))}

          {/* Summary section with special styling */}
          {visibleSections
            .filter(section => section.type === 'summary')
            .map(section => (
              <div 
                key={section.id}
                style={{ 
                  marginBottom: '20px',
                  backgroundColor: section.settings.backgroundColor,
                  padding: '15px',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontStyle: 'italic',
                  borderTop: `3px solid ${templateData.globalSettings.primaryColor}`
                }}
              >
                <h2 style={{ 
                  borderBottom: `2px solid ${templateData.globalSettings.secondaryColor}`,
                  paddingBottom: '5px',
                  marginTop: 0,
                  color: templateData.globalSettings.primaryColor,
                  display: 'inline-block'
                }}>
                  {section.title}
                </h2>
                {renderSectionContent(section)}
              </div>
            ))}
            
          {/* Two column layout for the rest of the content */}
          <div style={{ display: 'flex', gap: '20px' }}>
            {/* Left column */}
            <div style={{ flex: '1' }}>
              {visibleSections
                .filter(section => ['experience', 'education'].includes(section.type))
                .map(section => (
                  <div 
                    key={section.id}
                    style={{ 
                      marginBottom: '20px',
                      backgroundColor: section.settings.backgroundColor,
                      padding: '10px',
                      borderRadius: '4px',
                    }}
                  >
                    <h2 style={{ 
                      borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                      paddingBottom: '5px',
                      marginTop: 0,
                      color: templateData.globalSettings.primaryColor
                    }}>
                      {section.title}
                    </h2>
                    {renderSectionContent(section)}
                  </div>
                ))}
            </div>
            
            {/* Right column */}
            <div style={{ flex: '1' }}>
              {visibleSections
                .filter(section => ['skills', 'languages', 'certificates'].includes(section.type))
                .map(section => (
                  <div 
                    key={section.id}
                    style={{ 
                      marginBottom: '20px',
                      backgroundColor: section.settings.backgroundColor,
                      padding: '10px',
                      borderRadius: '4px',
                    }}
                  >
                    <h2 style={{ 
                      borderBottom: `2px solid ${templateData.globalSettings.primaryColor}`,
                      paddingBottom: '5px',
                      marginTop: 0,
                      color: templateData.globalSettings.primaryColor
                    }}>
                      {section.title}
                    </h2>
                    {renderSectionContent(section)}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTemplateRenderer;
