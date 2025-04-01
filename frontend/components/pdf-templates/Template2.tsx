'use client';

import React from 'react';
import Image from 'next/image';
import { PDFTemplateProps } from './types';

const Template2: React.FC<PDFTemplateProps> = ({ data, language, translations = {} }) => {
  // RTL desteği
  const isRTL = language === 'ar';
  
  // Çevirileri al
  const { summary, experience, education, skills, languages, certificates, present, skill_level } = translations;

  return (
    <div
      id="pdf-container"
      style={{
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.4,
        color: '#333',
        maxWidth: '100%',
        margin: '0 auto',
        direction: isRTL ? 'rtl' : 'ltr',
        textAlign: isRTL ? 'right' : 'left',
        fontSize: '10pt',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#1976D2',
          color: 'white',
          padding: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '16pt' }}>
            {data.personal_info?.first_name} {data.personal_info?.last_name}
          </h1>
          {data.personal_info?.title && (
            <p style={{ margin: '0 0 5px 0', fontSize: '12pt' }}>
              {data.personal_info.title}
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '9pt' }}>
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
        
        {/* Profile picture */}
        {data.personal_info?.photo && (
          <div>
            <Image
              src={data.personal_info.photo}
              alt="Profile"
              width={80}
              height={80}
              priority={true}
              style={{
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid white'
              }}
            />
          </div>
        )}
      </div>

      {/* Summary */}
      {data.personal_info?.summary && (
        <div style={{ margin: '0 0 10px 0', padding: '0 15px' }}>
          <h2 style={{ color: '#1976D2', margin: '0 0 5px 0', fontSize: '12pt', borderBottom: '1px solid #eee', paddingBottom: '3px' }}>
            {summary || 'Profesyonel Özet'}
          </h2>
          <p style={{ margin: 0, textAlign: 'justify', fontSize: '9pt' }}>{data.personal_info.summary}</p>
        </div>
      )}

      {/* 2 column layout for the rest */}
      <div style={{ display: 'flex', gap: '15px', padding: '0 15px' }}>
        {/* Left column */}
        <div style={{ flex: '1' }}>
          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <h2 style={{ color: '#1976D2', margin: '0 0 5px 0', fontSize: '12pt', borderBottom: '1px solid #eee', paddingBottom: '3px' }}>
                {experience || 'İş Deneyimi'}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.experience.map((exp, index) => (
                  <div key={index}>
                    <h3 style={{ margin: '0 0 2px 0', fontSize: '11pt' }}>{exp.position}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt' }}>
                      <span>{exp.company}{exp.location ? `, ${exp.location}` : ''}</span>
                      <span style={{ color: '#666' }}>{exp.start_date} - {exp.end_date || present || 'Halen'}</span>
                    </div>
                    <p style={{ margin: '2px 0 0 0', fontSize: '9pt', textAlign: 'justify' }}>{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <h2 style={{ color: '#1976D2', margin: '0 0 5px 0', fontSize: '12pt', borderBottom: '1px solid #eee', paddingBottom: '3px' }}>
                {education || 'Eğitim'}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.education.map((edu, index) => (
                  <div key={index}>
                    <h3 style={{ margin: '0 0 2px 0', fontSize: '11pt' }}>{edu.degree}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt' }}>
                      <span>{edu.school}{edu.location ? `, ${edu.location}` : ''}</span>
                      <span style={{ color: '#666' }}>{edu.start_date} - {edu.end_date || present || 'Halen'}</span>
                    </div>
                    <p style={{ margin: '2px 0 0 0', fontSize: '9pt', textAlign: 'justify' }}>{edu.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ width: '40%' }}>
          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <h2 style={{ color: '#1976D2', margin: '0 0 5px 0', fontSize: '12pt', borderBottom: '1px solid #eee', paddingBottom: '3px' }}>
                {skills || 'Beceriler'}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {data.skills.map((skill, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt' }}>
                    <span>{skill.name}</span>
                    {skill.level && (
                      <span>
                        {Array.from({ length: skill.level }).map((_, i) => (
                          <span key={i} style={{ color: '#1976D2', marginLeft: '1px' }}>●</span>
                        ))}
                        {Array.from({ length: 5 - (skill.level || 0) }).map((_, i) => (
                          <span key={i} style={{ color: '#eee', marginLeft: '1px' }}>●</span>
                        ))}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <h2 style={{ color: '#1976D2', margin: '0 0 5px 0', fontSize: '12pt', borderBottom: '1px solid #eee', paddingBottom: '3px' }}>
                {languages || 'Diller'}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {data.languages.map((lang, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt' }}>
                    <span>{lang.name}</span>
                    {lang.level && (
                      <span>
                        {Array.from({ length: lang.level }).map((_, i) => (
                          <span key={i} style={{ color: '#1976D2', marginLeft: '1px' }}>●</span>
                        ))}
                        {Array.from({ length: 5 - (lang.level || 0) }).map((_, i) => (
                          <span key={i} style={{ color: '#eee', marginLeft: '1px' }}>●</span>
                        ))}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates */}
          {data.certificates && data.certificates.length > 0 && (
            <div>
              <h2 style={{ color: '#1976D2', margin: '0 0 5px 0', fontSize: '12pt', borderBottom: '1px solid #eee', paddingBottom: '3px' }}>
                {certificates || 'Sertifikalar'}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {data.certificates.map((cert, index) => (
                  <div key={index} style={{ fontSize: '9pt' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold' }}>{cert.name}</span>
                      {cert.date && <span style={{ color: '#666' }}>{cert.date}</span>}
                    </div>
                    <div>{cert.issuer}{cert.description ? ` - ${cert.description}` : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Template2; 