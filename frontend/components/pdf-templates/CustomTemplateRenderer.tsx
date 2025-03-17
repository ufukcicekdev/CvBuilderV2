import React from 'react';
import { PDFTemplateProps } from './types';
import { CustomTemplateData, TemplateSection } from './TemplateBuilder';

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
      flexDirection: templateData.globalSettings.layout === 'single' ? 'column' : 'row'
    }}>
      <div style={{ 
        textAlign: templateData.globalSettings.layout === 'single' ? 'center' : 'left',
        marginBottom: templateData.globalSettings.layout === 'single' ? '10px' : '0'
      }}>
        <h1 style={{ 
          margin: '0 0 5px 0', 
          fontSize: `${section.settings.fontSize || templateData.globalSettings.fontSize + 6}pt`,
          color: section.settings.textColor
        }}>
          {data.personal_info?.first_name} {data.personal_info?.last_name}
        </h1>
        {data.personal_info?.title && (
          <p style={{ 
            margin: '0 0 5px 0', 
            fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) - 1}pt`,
            color: section.settings.textColor
          }}>
            {data.personal_info.title}
          </p>
        )}
        <div style={{ 
          display: 'flex', 
          flexDirection: templateData.globalSettings.layout === 'single' ? 'row' : 'column',
          flexWrap: 'wrap', 
          gap: '8px', 
          fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) - 2}pt`,
          color: section.settings.textColor,
          justifyContent: templateData.globalSettings.layout === 'single' ? 'center' : 'flex-start'
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
        <div>
          <img
            src={data.personal_info.photo}
            alt="Profile"
            style={{
              width: `${templateData.globalSettings.photoSize}px`,
              height: `${templateData.globalSettings.photoSize}px`,
              borderRadius: templateData.globalSettings.photoStyle === 'circle' 
                ? '50%' 
                : templateData.globalSettings.photoStyle === 'rounded' 
                  ? '10px' 
                  : '0',
              objectFit: 'cover',
              border: `2px solid ${templateData.globalSettings.primaryColor}`
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
  
  return (
    <div
      id="pdf-container"
      style={{
        fontFamily: templateData.globalSettings.fontFamily,
        fontSize: `${templateData.globalSettings.fontSize}pt`,
        backgroundColor: templateData.globalSettings.backgroundColor,
        padding: '15px',
        color: '#333',
        maxWidth: '100%',
        margin: '0 auto',
        direction: isRTL ? 'rtl' : 'ltr',
        textAlign: isRTL ? 'right' : 'left',
      }}
    >
      {templateData.globalSettings.layout === 'single' ? (
        // Tek sütunlu düzen
        <>
          {visibleSections.map((section) => (
            <div 
              key={section.id}
              style={{
                backgroundColor: section.settings.backgroundColor,
                marginBottom: '15px',
                padding: '10px',
                borderRadius: '3px',
                borderLeft: `3px solid ${templateData.globalSettings.primaryColor}`
              }}
            >
              {section.type !== 'header' && (
                <h2 style={{ 
                  color: templateData.globalSettings.primaryColor, 
                  margin: '0 0 8px 0', 
                  fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) + 2}pt`,
                  borderBottom: `1px solid ${templateData.globalSettings.secondaryColor}`,
                  paddingBottom: '5px'
                }}>
                  {section.title}
                </h2>
              )}
              {renderSectionContent(section)}
            </div>
          ))}
        </>
      ) : (
        // Çift sütunlu düzen
        <div style={{ display: 'flex', gap: '15px' }}>
          {/* Sol sütun (geniş) */}
          <div style={{ flex: '3' }}>
            {visibleSections
              .filter(section => ['header', 'summary', 'experience', 'education'].includes(section.type))
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <div 
                  key={section.id}
                  style={{
                    backgroundColor: section.settings.backgroundColor,
                    marginBottom: '15px',
                    padding: '10px',
                    borderRadius: '3px',
                    borderLeft: `3px solid ${templateData.globalSettings.primaryColor}`
                  }}
                >
                  {section.type !== 'header' && (
                    <h2 style={{ 
                      color: templateData.globalSettings.primaryColor, 
                      margin: '0 0 8px 0', 
                      fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) + 2}pt`,
                      borderBottom: `1px solid ${templateData.globalSettings.secondaryColor}`,
                      paddingBottom: '5px'
                    }}>
                      {section.title}
                    </h2>
                  )}
                  {renderSectionContent(section)}
                </div>
              ))}
          </div>
          
          {/* Sağ sütun (dar) */}
          <div style={{ flex: '1' }}>
            {visibleSections
              .filter(section => ['skills', 'languages', 'certificates'].includes(section.type))
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <div 
                  key={section.id}
                  style={{
                    backgroundColor: section.settings.backgroundColor,
                    marginBottom: '15px',
                    padding: '10px',
                    borderRadius: '3px',
                    borderLeft: `3px solid ${templateData.globalSettings.primaryColor}`
                  }}
                >
                  <h2 style={{ 
                    color: templateData.globalSettings.primaryColor, 
                    margin: '0 0 8px 0', 
                    fontSize: `${(section.settings.fontSize || templateData.globalSettings.fontSize) + 2}pt`,
                    borderBottom: `1px solid ${templateData.globalSettings.secondaryColor}`,
                    paddingBottom: '5px'
                  }}>
                    {section.title}
                  </h2>
                  {renderSectionContent(section)}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTemplateRenderer;
