import React from 'react';
import Head from 'next/head';

const SEO = () => {
  const title = "Jeanyoon Choi - PhD Research: Multi-Device Web Artwork (MDWA)";
  const description = "PhD qualification research by Jeanyoon Choi (KAIST XD Lab) on Multi-Device Web Artwork (MDWA), a semantic and modular framework for interactive systems art. Explore topics in media art, interactive art, and state-based architecture.";
  const keywords = [
    'multi-device web artwork', 'media art', 'phd research', 'media art phd', 
    'jeanyoon choi', 'mdwa', 'interactive art', 'systems art', 'interactive taxonomy', 
    'state-based architecture', 'dimensional transformation', 'kaist', 'xd lab', 
    'research through exhibition'
  ];
  const siteUrl = "https://mdwa-phd.vercel.app"; // Replace with your actual domain

  const structuredData = {
    "@context": "http://portfolio-jyc.org",
    "@type": "ScholarlyArticle",
    "headline": title,
    "author": {
      "@type": "Person",
      "name": "Jeanyoon Choi",
      "affiliation": {
        "@type": "CollegeOrUniversity",
        "name": "KAIST, Department of Industrial Design, XD Lab"
      }
    },
    "keywords": keywords.join(', '),
    "description": description,
    "url": siteUrl
  };

  return (
    <Head>
      {/* Standard SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content="Jeanyoon Choi" />
      <link rel="canonical" href={siteUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
   
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={siteUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  );
};

export default SEO; 