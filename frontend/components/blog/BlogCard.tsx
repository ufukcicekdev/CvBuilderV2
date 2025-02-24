import { Card, CardContent, CardMedia, Typography, Box, Chip } from '@mui/material';
import { useRouter } from 'next/router';
import { formatDistance } from 'date-fns';
import { tr, enUS, es, zhCN, ar, hi } from 'date-fns/locale';
import { BlogPost } from '../../types/blog';

const locales = {
  tr,
  en: enUS,
  es,
  zh: zhCN,
  ar,
  hi
};

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const router = useRouter();
  const currentLocale = router.locale || 'tr';

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-4px)',
          transition: 'all 0.3s ease-in-out'
        }
      }}
      onClick={() => router.push(`/blog/${post.current_translation.slug}`)}
    >
      <CardMedia
        component="img"
        sx={{
          width: { xs: '100%', sm: 240 },
          height: { xs: 200, sm: 240 }
        }}
        image={post.featured_image || '/images/blog-placeholder.jpg'}
        alt={post.current_translation.title}
      />
      <CardContent sx={{ flex: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Chip
            label={post.category.name}
            size="small"
            color="primary"
            sx={{ mr: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            {formatDistance(new Date(post.created_at), new Date(), {
              addSuffix: true,
              locale: locales[currentLocale as keyof typeof locales]
            })}
          </Typography>
        </Box>
        <Typography variant="h5" component="h2" gutterBottom>
          {post.current_translation.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {post.current_translation.summary}
        </Typography>
      </CardContent>
    </Card>
  );
} 