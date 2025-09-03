import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Translation {
    language: string;
    title: string;
}

interface BlogPost {
    id: number;
    slug: string;
    translations: Translation[];
    created_at: string;
}

interface BlogCardProps {
    post: BlogPost;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
    const { locale } = useRouter();

    // Find the best title to display
    const translation = post.translations.find(t => t.language === locale) || post.translations[0];
    const title = translation ? translation.title : "No Title";

    return (
        <div style={{ border: '1px solid #ddd', padding: '20px', marginBottom: '20px', borderRadius: '5px' }}>
            <h2>
                <Link href={`/blog/${post.slug}`}>
                    {title}
                </Link>
            </h2>
            <p>Posted on {new Date(post.created_at).toLocaleDateString()}</p>
        </div>
    );
};

export default BlogCard;