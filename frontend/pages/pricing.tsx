import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Paper,
  useTheme,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pricing-tabpanel-${index}`}
      aria-labelledby={`pricing-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function Pricing() {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [isYearly, setIsYearly] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const PricingCard = ({ type }: { type: 'jobseeker' | 'employer' }) => {
    const { t, i18n } = useTranslation('common');
    
    const price = isYearly 
      ? Number(t(`pricing.${type}.price.yearly`))
      : Number(t(`pricing.${type}.price.monthly`));
    
    const features = t(`pricing.${type}.features`, { 
      returnObjects: true,
      defaultValue: t(`pricing.${type}.features`, { 
        lng: 'tr',
        returnObjects: true 
      }) 
    });

    const featureList = Array.isArray(features) ? features : [];

    return (
      <Card 
        elevation={3}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-8px)',
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 4 }}>
          <Typography variant="h5" component="h3" gutterBottom align="center">
            {t(`pricing.${type}.title`)}
          </Typography>
          
          <Box sx={{ my: 3, textAlign: 'center' }}>
            <Typography variant="h3" component="div" color="primary">
              ${price}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {isYearly ? t('pricing.perYear') : t('pricing.perMonth')}
            </Typography>
          </Box>

          <List>
            {featureList.map((feature, index) => (
              <ListItem key={index} sx={{ py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={feature} />
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              color="primary"
            >
              {t('pricing.selectPlan')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          {t('pricing.title')}
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          {t('pricing.description')}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isYearly}
                onChange={(e) => setIsYearly(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>{t('pricing.monthly')}</Typography>
                <Typography
                  sx={{
                    bgcolor: 'success.main',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                  }}
                >
                  {t('pricing.saveYearly')}
                </Typography>
                <Typography>{t('pricing.yearly')}</Typography>
              </Box>
            }
            labelPlacement="end"
          />
        </Box>

        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                fontSize: '1.1rem',
                py: 2,
              },
            }}
          >
            <Tab label={t('pricing.jobseeker.title')} />
            {/* <Tab label={t('pricing.employer.title')} /> */}
          </Tabs>
        </Paper>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <PricingCard type="jobseeker" />
          </Box>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <PricingCard type="employer" />
          </Box>
        </TabPanel>
      </Container>
    </Layout>
  );
}

export const getStaticProps = async ({ locale = 'tr' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}; 