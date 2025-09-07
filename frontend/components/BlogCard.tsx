import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// MUI Imports
import {
    Card,
    CardActionArea,
    CardContent,
    Typography,
    Box
} from '@mui/material';
import {
    CalendarMonth as CalendarMonthIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';

// --- Helper function for excerpt ---
const createExcerpt = (htmlContent: string, maxLength = 100) => {
    if (!htmlContent) return '';
    const text = htmlContent.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (text.length <= maxLength) return text;
    const truncated = text.substr(0, text.lastIndexOf(' ', maxLength));
    return `${truncated}...`;
};

interface Translation {
    language: string;
    title: string;
    content: string; // Added content
}

interface BlogPost {
    id: number;
    slug: string;
    translations: Translation[];
    created_at: string;
    view_count: number;
}

interface BlogCardProps {
    post: BlogPost;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
    const { locale } = useRouter();

    // Find the best translation to display
    const translation = post.translations.find(t => t.language === locale) || post.translations[0];
    const title = translation ? translation.title : "No Title";
    const excerpt = translation ? createExcerpt(translation.content) : "";

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardActionArea component={Link} href={`/blog/${post.slug}`} sx={{ flexGrow: 1 }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 2 }}>
                        {excerpt}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2} color="text.secondary" mt={1}>
                        <Box display="flex" alignItems="center" sx={{ fontSize: '0.875rem' }}>
                            <CalendarMonthIcon sx={{ mr: 0.5, fontSize: 'inherit' }} />
                            <Typography variant="body2">
                                {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" sx={{ fontSize: '0.875rem' }}>
                            <VisibilityIcon sx={{ mr: 0.5, fontSize: 'inherit' }} />
                            <Typography variant="body2">
                                {new Intl.NumberFormat().format(post.view_count)}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default BlogCard;