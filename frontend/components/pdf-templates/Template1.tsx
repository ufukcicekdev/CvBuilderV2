import React from 'react';
import { PDFTemplateProps } from './types';

const Template1: React.FC<PDFTemplateProps> = ({ data, language, translations = {} }) => {
  // RTL desteği için (Arapça vb. diller için)
  const isRTL = language === 'ar';
  
  // Bölüm başlıkları için çevirileri al
  const { summary, experience, education, skills, languages, certificates, present, skill_level } = translations;

  return (
    <div
      id="pdf-container"
      style={{
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.4, // daha kompakt satır yüksekliği
        color: '#333',
        padding: '12px', // daha az padding
        direction: isRTL ? 'rtl' : 'ltr',
        textAlign: isRTL ? 'right' : 'left',
        maxWidth: '100%', // tam genişlik
        margin: '0 auto',
        fontSize: '10pt', // daha küçük temel yazı tipi
      }}
    >
      <div
        style={{
          textAlign: 'center',
          marginBottom: '15px', // daha az margin
          borderBottom: '1px solid #2196f3', // daha ince çizgi
          paddingBottom: '10px', // daha az padding
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {data.personal_info?.photo && (
          <div style={{ marginBottom: '8px' }}>
            <img
              src={data.personal_info.photo}
              alt="Profile"
              style={{
                width: '80px', // daha küçük fotoğraf
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #2196f3' // daha ince çerçeve
              }}
            />
          </div>
        )}
        <h1 style={{ margin: '0 0 4px 0', fontSize: '16pt' }}> {/* daha küçük başlık */}
          {data.personal_info?.first_name ? data.personal_info.first_name : ''}{' '}
          {data.personal_info?.last_name ? data.personal_info.last_name : ''}
        </h1>
        {data.personal_info?.title && (
          <div style={{ fontSize: '12pt', marginBottom: '5px', color: '#555' }}>
            {data.personal_info.title}
          </div>
        )}
        <div style={{ fontSize: '9pt', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
          {data.personal_info?.email && (
            <span style={{ marginRight: '10px' }}>
              📧 {data.personal_info.email}
            </span>
          )}
          {data.personal_info?.phone && (
            <span style={{ marginRight: '10px' }}>
              📱 {data.personal_info.phone}
            </span>
          )}
          {data.personal_info?.location && (
            <span>
              📍 {data.personal_info.location}
            </span>
          )}
        </div>
      </div>

      {data.personal_info?.summary && (
        <div style={{ marginBottom: '15px' }}>
          <h2 style={{ fontSize: '12pt', borderBottom: '1px solid #ddd', paddingBottom: '4px', margin: '0 0 8px 0', color: '#2196f3' }}>
            {summary || 'Profesyonel Özet'}
          </h2>
          <p style={{ margin: 0, textAlign: 'justify' }}>{data.personal_info.summary}</p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <h2 style={{ fontSize: '12pt', borderBottom: '1px solid #ddd', paddingBottom: '4px', margin: '0 0 8px 0', color: '#2196f3' }}>
            {experience || 'İş Deneyimi'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}> {/* daha az boşluk */}
            {data.experience.map((exp, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{exp.position}</div>
                    <div>{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                  </div>
                  <div style={{ fontSize: '9pt', color: '#666', textAlign: 'right' }}>
                    {exp.start_date} - {exp.end_date || present || 'Halen'}
                  </div>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '9pt', textAlign: 'justify' }}>{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Eğitim bölümü - daha kompakt */}
      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <h2 style={{ fontSize: '12pt', borderBottom: '1px solid #ddd', paddingBottom: '4px', margin: '0 0 8px 0', color: '#2196f3' }}>
            {education || 'Eğitim'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.education.map((edu, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{edu.degree}</div>
                    <div>{edu.school}{edu.location ? `, ${edu.location}` : ''}</div>
                  </div>
                  <div style={{ fontSize: '9pt', color: '#666', textAlign: 'right' }}>
                    {edu.start_date} - {edu.end_date || present || 'Halen'}
                  </div>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '9pt', textAlign: 'justify' }}>{edu.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Beceriler ve Diller bölümlerini yan yana yerleştir */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        {/* Beceriler */}
        {data.skills && data.skills.length > 0 && (
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '12pt', borderBottom: '1px solid #ddd', paddingBottom: '4px', margin: '0 0 8px 0', color: '#2196f3' }}>
              {skills || 'Beceriler'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {data.skills.map((skill, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{skill.name}</span>
                  {skill.level && (
                    <span>
                      {Array.from({ length: skill.level }).map((_, i) => (
                        <span key={i} style={{ color: '#2196f3', marginLeft: '2px' }}>●</span>
                      ))}
                      {Array.from({ length: 5 - (skill.level || 0) }).map((_, i) => (
                        <span key={i} style={{ color: '#ddd', marginLeft: '2px' }}>●</span>
                      ))}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diller */}
        {data.languages && data.languages.length > 0 && (
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '12pt', borderBottom: '1px solid #ddd', paddingBottom: '4px', margin: '0 0 8px 0', color: '#2196f3' }}>
              {languages || 'Diller'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {data.languages.map((lang, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{lang.name}</span>
                  {lang.level && (
                    <span>
                      {Array.from({ length: lang.level }).map((_, i) => (
                        <span key={i} style={{ color: '#2196f3', marginLeft: '2px' }}>●</span>
                      ))}
                      {Array.from({ length: 5 - (lang.level || 0) }).map((_, i) => (
                        <span key={i} style={{ color: '#ddd', marginLeft: '2px' }}>●</span>
                      ))}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sertifikalar */}
      {data.certificates && data.certificates.length > 0 && (
        <div>
          <h2 style={{ fontSize: '12pt', borderBottom: '1px solid #ddd', paddingBottom: '4px', margin: '0 0 8px 0', color: '#2196f3' }}>
            {certificates || 'Sertifikalar'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {data.certificates.map((cert, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 'bold' }}>{cert.name}</div>
                  {cert.date && <div style={{ fontSize: '9pt', color: '#666' }}>{cert.date}</div>}
                </div>
                <div style={{ fontSize: '9pt' }}>
                  {cert.issuer} {cert.description ? ` - ${cert.description}` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Template1; 