import React, { useState, useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';

// MUI Imports
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Snackbar,
    IconButton,
    Box,
    Typography,
    Container
} from '@mui/material';
import {
    Share as ShareIcon,
    Facebook as FacebookIcon,
    LinkedIn as LinkedInIcon,
    WhatsApp as WhatsAppIcon,
    ContentCopy as ContentCopyIcon,
    Close as CloseIcon,
    Visibility as VisibilityIcon,
    CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material';

import SEO from '../../components/SEO';
import { getBlogBySlug, getAllBlogSlugs } from '../../services/blogService';

// --- Helper function for SEO description ---
const createExcerpt = (htmlContent: string, maxLength = 155) => {
    if (!htmlContent) return '';
    const text = htmlContent.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (text.length <= maxLength) return text;
    const truncated = text.substr(0, text.lastIndexOf(' ', maxLength));
    return `${truncated}...`;
};

// --- MUI Share Modal ---
interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCopy: () => void;
    title: string;
    url: string;
}

const MuiShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, onCopy, title, url }) => {
    const { t } = useTranslation('common');

    if (!isOpen || !url) return null;

    const shareOptions = [
        {
            text: 'Facebook',
            icon: <FacebookIcon sx={{ color: '#1877F2' }} />,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        },
        {
            text: 'LinkedIn',
            icon: <LinkedInIcon sx={{ color: '#0A66C2' }} />,
            href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
        },
        {
            text: 'WhatsApp',
            icon: <WhatsAppIcon sx={{ color: '#25D366' }} />,
            href: `https://api.whatsapp.com/send?text=${encodeURIComponent(title)}%20${encodeURIComponent(url)}`,
        },
    ];

    return (
        <Dialog open={isOpen} onClose={onClose} aria-labelledby="share-dialog-title">
            <DialogTitle id="share-dialog-title" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                {t('blog.shareTitle')}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8, color: 'primary.contrastText' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <List sx={{ pt: 0 }}>
                    {shareOptions.map((option) => (
                        <ListItemButton component="a" href={option.href} target="_blank" rel="noopener noreferrer" key={option.text} onClick={onClose}>
                            <ListItemIcon>{option.icon}</ListItemIcon>
                            <ListItemText primary={option.text} />
                        </ListItemButton>
                    ))}
                    <ListItemButton onClick={onCopy}>
                        <ListItemIcon><ContentCopyIcon /></ListItemIcon>
                        <ListItemText primary={t('blog.copyLink')} />
                    </ListItemButton>
                </List>
            </DialogContent>
        </Dialog>
    );
};


// --- BlogDetail Component ---
interface BlogDetailProps {
    post: {
        title: string;
        content: string;
        created_at: string;
        view_count: number;
    };
}

const BlogDetail: React.FC<BlogDetailProps> = ({ post }) => {
    const { t } = useTranslation('common');
    const router = useRouter();
    const [postUrl, setPostUrl] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [isSnackbarOpen, setSnackbarOpen] = useState(false);
    // Removed showCookieWarning state

    // Removed useEffect for cookie consent

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPostUrl(window.location.href);
        }
    }, [router.asPath]);

    const handleCopy = () => {
        navigator.clipboard.writeText(postUrl).then(() => {
            setModalOpen(false);
            setSnackbarOpen(true);
        });
    };

    if (!post) {
        return <div>{t('blog.loading')}</div>;
    }

    const seoDescription = createExcerpt(post.content);

    return (
        <Layout>
            <SEO 
                title={post.title}
                description={seoDescription}
                ogType="article"
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Container maxWidth="md" sx={{ my: { xs: 10, md: 15 } }}>
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {post.title}
                    </Typography>

                    <Box display="flex" flexWrap="wrap" alignItems="center" gap={2} color="text.secondary" mb={2}>
                        <Box display="flex" alignItems="center">
                            <CalendarMonthIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                            <Typography variant="body2">
                                {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                            <VisibilityIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                            <Typography variant="body2">
                                {new Intl.NumberFormat().format(post.view_count)} {t('blog.views')}
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ShareIcon />}
                        onClick={() => setModalOpen(true)}
                        sx={{ mb: 2 }}
                    >
                        {t('blog.share')}
                    </Button>

                    <hr style={{ margin: '20px 0' }} />

                    {/* Removed conditional Typography warning */}

                    <Box
                        className="blog-content"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                        sx={{
                            marginTop: '20px',
                            lineHeight: 1.7,
                            '& h1, & h2, & h3, & h4, & h5, & h6': {
                                fontWeight: 'bold',
                                marginBottom: '1rem',
                                lineHeight: 1.3,
                            },
                            '& p': {
                                marginBottom: '1rem',
                            },
                            '& a': {
                                color: 'primary.main',
                                textDecoration: 'none',
                                '&:hover': {
                                    textDecoration: 'underline',
                                }
                            },
                            '& img': {
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '8px',
                            },
                            '& ul, & ol': {
                                paddingLeft: '2em',
                                marginBottom: '1rem',
                            }
                        }}
                    />
                </Container>
            </motion.div>

            <MuiShareModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onCopy={handleCopy}
                title={post.title}
                url={postUrl}
            />

            <Snackbar
                open={isSnackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                message={t('blog.copied')}
            />
        </Layout>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    try {
        const paths = await getAllBlogSlugs();
        return {
            paths,
            fallback: 'blocking',
        };
    } catch (error) {
        console.error('Error fetching blog slugs:', error);
        return {
            paths: [],
            fallback: 'blocking',
        };
    }
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
    try {
        const slug = params?.slug as string;
        const post = await getBlogBySlug(slug, locale || 'tr');
        return {
            props: {
                post,
                ...(await serverSideTranslations(locale || 'tr', ['common'])),
            },
            revalidate: 60,
        };
    } catch (error) {
        console.error(`Error fetching blog with slug: ${params?.slug}` , error);
        return {
            notFound: true,
        };
    }
};

export default BlogDetail;
