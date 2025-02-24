import { Box, Paper, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { BlogCategory } from '../../types/blog';

interface BlogSidebarProps {
  categories: BlogCategory[];
  selectedCategory: string | null;
  onCategoryClick: (slug: string) => void;
}

export default function BlogSidebar({
  categories,
  selectedCategory,
  onCategoryClick
}: BlogSidebarProps) {
  const { t } = useTranslation('common');

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('blog.categories')}
      </Typography>
      <List>
        {categories.map((category) => (
          <ListItem
            key={category.id}
            sx={{
              cursor: 'pointer',
              bgcolor: selectedCategory === category.slug ? 'action.selected' : 'transparent',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
            onClick={() => onCategoryClick(category.slug)}
          >
            <ListItemText primary={category.name} />
            <Chip
              label={category.post_count}
              size="small"
              color={selectedCategory === category.slug ? 'primary' : 'default'}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
} 