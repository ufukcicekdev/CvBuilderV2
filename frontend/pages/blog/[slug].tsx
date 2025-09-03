import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { getBlogBySlug, getAllBlogSlugs } from '../../services/blogService';
import Navbar from '../../components/Navbar'; // Assuming Navbar is the correct header

interface BlogDetailProps {
    post: {
        title: string;
        content: string;
        created_at: string;
    };
}

const BlogDetail: React.FC<BlogDetailProps> = ({ post }) => {
    const { t } = useTranslation('common');

    if (!post) {
        return <div>{t('blog.loading', 'Loading...')}</div>;
    }

    return (
        <>
            <Navbar />
            <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '100px auto' }}>
                <h1>{post.title}</h1>
                <p>Posted on {new Date(post.created_at).toLocaleDateString()}</p>
                <hr style={{ margin: '20px 0' }} />
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
            <Footer />
        </>
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