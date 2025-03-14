import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Grid,
  CircularProgress
} from '@mui/material'
import { useTranslation } from 'next-i18next'
import { CV } from '@/types/cv'
import ModernTemplate from '@/templates/web/ModernTemplate'
import MinimalTemplate from '@/templates/web/MinimalTemplate'
import ColorfulTemplate from '@/templates/web/ColorfulTemplate'
import ProfessionalTemplate from '@/templates/web/ProfessionalTemplate'
import CreativeTemplate from '@/templates/web/CreativeTemplate'

interface TemplatePreviewCardProps {
  name: string
  description: string
  image: string
  selected: boolean
  onClick: () => void
}

const TemplatePreviewCard = ({
  name,
  description,
  image,
  selected,
  onClick
}: TemplatePreviewCardProps) => {
  return (
    <Card
      sx={{
        height: '100%',
        border: selected ? 2 : 0,
        borderColor: 'primary.main',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardActionArea onClick={onClick} sx={{ flexGrow: 1 }}>
        <CardMedia
          component="img"
          height="120"
          image={image}
          alt={name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent>
          <Typography variant="subtitle1" component="div" fontWeight="bold">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

interface CVPreviewTemplatesProps {
  cv: CV | null
  selectedTemplate: string | null
  onTemplateSelect: (templateId: string) => void
  isLoading?: boolean
}

// SVG içerikleri
const modernWebTemplateSvg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#f5f5f5"/>
  <rect x="20" y="20" width="100" height="100" rx="50" fill="#2196f3"/>
  <rect x="140" y="30" width="240" height="20" rx="4" fill="#333"/>
  <rect x="140" y="60" width="180" height="15" rx="4" fill="#666"/>
  <rect x="140" y="85" width="220" height="15" rx="4" fill="#666"/>
  <rect x="20" y="140" width="360" height="1" fill="#ddd"/>
  <rect x="20" y="160" width="150" height="15" rx="4" fill="#2196f3"/>
  <rect x="20" y="185" width="360" height="10" rx="4" fill="#eee"/>
  <rect x="20" y="205" width="360" height="10" rx="4" fill="#eee"/>
  <rect x="20" y="225" width="360" height="10" rx="4" fill="#eee"/>
  <rect x="20" y="245" width="360" height="10" rx="4" fill="#eee"/>
  <rect x="20" y="265" width="180" height="10" rx="4" fill="#eee"/>
</svg>`;

const minimalWebTemplateSvg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#f8f8f8"/>
  <rect x="20" y="20" width="360" height="40" rx="4" fill="#333"/>
  <rect x="30" y="30" width="200" height="20" rx="4" fill="#fff"/>
  <rect x="20" y="80" width="150" height="20" rx="4" fill="#444"/>
  <rect x="20" y="110" width="360" height="1" fill="#ddd"/>
  <rect x="20" y="130" width="100" height="15" rx="4" fill="#555"/>
  <rect x="20" y="155" width="360" height="10" rx="4" fill="#eee"/>
  <rect x="20" y="175" width="360" height="10" rx="4" fill="#eee"/>
  <rect x="20" y="195" width="360" height="10" rx="4" fill="#eee"/>
  <rect x="20" y="225" width="100" height="15" rx="4" fill="#555"/>
  <rect x="20" y="250" width="360" height="10" rx="4" fill="#eee"/>
  <rect x="20" y="270" width="360" height="10" rx="4" fill="#eee"/>
</svg>`;

const colorfulWebTemplateSvg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#FFFFFF"/>
  <rect x="20" y="20" width="100" height="100" rx="50" fill="#FF6B6B"/>
  <rect x="140" y="30" width="240" height="20" rx="4" fill="#333"/>
  <rect x="140" y="60" width="180" height="15" rx="4" fill="#666"/>
  <rect x="140" y="85" width="220" height="15" rx="4" fill="#666"/>
  <rect x="20" y="140" width="360" height="1" fill="#ddd"/>
  <rect x="20" y="160" width="150" height="15" rx="4" fill="#FF6B6B"/>
  <rect x="20" y="185" width="360" height="10" rx="4" fill="#F8F9FA"/>
  <rect x="20" y="205" width="360" height="10" rx="4" fill="#F8F9FA"/>
  <rect x="20" y="225" width="360" height="10" rx="4" fill="#F8F9FA"/>
  <rect x="20" y="245" width="360" height="10" rx="4" fill="#F8F9FA"/>
  <rect x="20" y="265" width="180" height="10" rx="4" fill="#F8F9FA"/>
</svg>`;

const professionalWebTemplateSvg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#F5F5F5"/>
  <rect x="0" y="0" width="400" height="60" fill="#1976D2"/>
  <rect x="20" y="20" width="200" height="20" rx="4" fill="#FFFFFF"/>
  <rect x="20" y="80" width="360" height="70" rx="4" fill="#FFFFFF"/>
  <rect x="20" y="170" width="170" height="110" rx="4" fill="#FFFFFF"/>
  <rect x="210" y="170" width="170" height="110" rx="4" fill="#FFFFFF"/>
</svg>`;

const creativeWebTemplateSvg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#F7F7F7"/>
  <rect x="0" y="0" width="400" height="120" fill="#121212"/>
  <path d="M400 0 L400 120 L0 0 Z" fill="#6200EA" fill-opacity="0.6"/>
  <path d="M0 120 L400 120 L0 0 Z" fill="#FF4081" fill-opacity="0.6"/>
  <rect x="20" y="150" width="360" height="60" rx="8" fill="#FFFFFF"/>
  <rect x="20" y="220" width="170" height="60" rx="8" fill="#FFFFFF"/>
  <rect x="210" y="220" width="170" height="60" rx="8" fill="#FFFFFF"/>
</svg>`;

// SVG'yi data URL'ine dönüştürme
const svgToDataUrl = (svgContent: string) => {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
};

const CVPreviewTemplates = ({
  cv,
  selectedTemplate,
  onTemplateSelect,
  isLoading = false
}: CVPreviewTemplatesProps) => {
  const { t } = useTranslation('common')
  const [selectedTab, setSelectedTab] = useState('web')
  const [iframeLoading, setIframeLoading] = useState(true)

  const webTemplates = [
    {
      id: 'modern',
      name: t('cv.templates.modern.name', 'Modern Template'),
      description: t('cv.templates.modern.description', 'A modern and interactive web design'),
      image: svgToDataUrl(modernWebTemplateSvg)
    },
    {
      id: 'minimal',
      name: t('cv.templates.minimal.name', 'Minimal Template'),
      description: t('cv.templates.minimal.description', 'A clean and elegant web design'),
      image: svgToDataUrl(minimalWebTemplateSvg)
    },
    {
      id: 'colorful',
      name: t('cv.templates.colorful.name', 'Colorful Template'),
      description: t('cv.templates.colorful.description', 'A vibrant and modern template with colorful accents'),
      image: svgToDataUrl(colorfulWebTemplateSvg)
    },
    {
      id: 'professional',
      name: t('cv.templates.professional.name', 'Professional Template'),
      description: t('cv.templates.professional.description', 'A clean and professional template for corporate profiles'),
      image: svgToDataUrl(professionalWebTemplateSvg)
    },
    {
      id: 'creative',
      name: t('cv.templates.creative.name', 'Creative Template'),
      description: t('cv.templates.creative.description', 'A unique and creative template for artistic profiles'),
      image: svgToDataUrl(creativeWebTemplateSvg)
    }
  ]

  const renderTemplate = () => {
    if (!cv || !selectedTemplate) return null

    // Template containerı için stil tanımı
    const templateContainer = {
      width: '100%',
      height: '100%',
      overflow: 'auto'
    }

    switch (selectedTemplate) {
      case 'modern':
        return <Box sx={templateContainer}><ModernTemplate cv={cv} /></Box>
      case 'minimal':
        return <Box sx={templateContainer}><MinimalTemplate cv={cv} /></Box>
      case 'colorful':
        return <Box sx={templateContainer}><ColorfulTemplate cv={cv} /></Box>
      case 'professional':
        return <Box sx={templateContainer}><ProfessionalTemplate cv={cv} /></Box>
      case 'creative':
        return <Box sx={templateContainer}><CreativeTemplate cv={cv} /></Box>
      default:
        return null
    }
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('cv.chooseTemplate', 'Choose Template')}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {webTemplates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <TemplatePreviewCard
              name={template.name}
              description={template.description}
              image={template.image}
              selected={selectedTemplate === template.id}
              onClick={() => onTemplateSelect(template.id)}
            />
          </Grid>
        ))}
      </Grid>

      {selectedTemplate && cv && (
        <Box sx={{ mt: 2, position: 'relative' }}>
          <Typography variant="h6" gutterBottom>
            {t('cv.preview', 'Preview')}
          </Typography>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden',
              height: '70vh',
              position: 'relative'
            }}
          >
            {(isLoading || iframeLoading) && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  zIndex: 1
                }}
              >
                <CircularProgress />
              </Box>
            )}
            <Box
              sx={{
                overflowY: 'auto',
                height: '100%',
                bgcolor: 'background.paper'
              }}
              onLoad={() => setIframeLoading(false)}
            >
              {renderTemplate()}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default CVPreviewTemplates 