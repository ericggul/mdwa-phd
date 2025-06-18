import React from 'react';
import Head from 'next/head';

const SEO = () => {
  const title = "MDWA: Multi-Device Web Artwork - PhD Research by Jeanyoon Choi";
  const description = "Exploring Multi-Device Web Artwork (MDWA) through PhD research at KAIST XD Lab. Interactive art, cross-device interfaces, HCI research, and new media art by Jeanyoon Choi. Semantic framework for multi-device interactive systems art.";
  const keywords = [
    'MDWA', 'Multi-Device Web Artwork', 'Jeanyoon Choi', 'PhD Research', 
    'Interactive Art', 'multi-device web', 'multi-device artwork', 'cross-device',
    'HCI PhD research', 'new media art PhD research', 'KAIST', 'XD Lab',
    'interactive systems art', 'cross-device interaction', 'web-based art',
    'digital art research', 'media art theory', 'interactive installation',
    'responsive art', 'adaptive interfaces', 'distributed interfaces',
    'research through exhibition', 'creative technology', 'human-computer interaction'
  ];
  const siteUrl = "https://mdwa-phd.vercel.app";
  const imageUrl = `${siteUrl}/api/og-image`; // We'll create this later

  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["ScholarlyArticle", "CreativeWork"],
    "headline": title,
    "alternativeHeadline": "Multi-Device Web Artwork: A PhD Research Framework",
    "author": {
      "@type": "Person",
      "name": "Jeanyoon Choi",
      "givenName": "Jeanyoon",
      "familyName": "Choi",
      "affiliation": {
        "@type": "CollegeOrUniversity",
        "name": "Korea Advanced Institute of Science and Technology (KAIST)",
        "department": "Department of Industrial Design",
        "subOrganization": "eXperience Design (XD) Lab"
      },
      "sameAs": [
        "https://portfolio-jyc.org",
        "https://orcid.org/your-orcid-id" // Add your ORCID if you have one
      ]
    },
    "about": [
      {
        "@type": "Thing",
        "name": "Multi-Device Web Artwork",
        "alternateName": "MDWA"
      },
      {
        "@type": "Thing",
        "name": "Interactive Art"
      },
      {
        "@type": "Thing",
        "name": "Cross-Device Interaction"
      },
      {
        "@type": "Thing",
        "name": "Human-Computer Interaction"
      }
    ],
    "keywords": keywords.join(', '),
    "description": description,
    "url": siteUrl,
    "image": imageUrl,
    "datePublished": "2025-01-01", // Update with actual date
    "dateModified": new Date().toISOString().split('T')[0],
    "publisher": {
      "@type": "Organization",
      "name": "KAIST XD Lab"
    },
    "inLanguage": "en",
    "genre": ["Research", "Interactive Art", "Digital Art"],
    "audience": {
      "@type": "Audience",
      "audienceType": ["Researchers", "Artists", "Designers", "Academics"]
    }
  };

  return (
    <Head>
      {/* Enhanced SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content="Jeanyoon Choi" />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <link rel="canonical" href={siteUrl} />

      {/* Academic/Research specific meta tags */}
      <meta name="citation_title" content={title} />
      <meta name="citation_author" content="Choi, Jeanyoon" />
      <meta name="citation_publication_date" content="2025" />
      <meta name="citation_institution" content="Korea Advanced Institute of Science and Technology (KAIST)" />
      <meta name="citation_pdf_url" content={`${siteUrl}/pdf/jeanyoon_choi_mdwa.pdf`} />
      <meta name="DC.Title" content={title} />
      <meta name="DC.Creator" content="Jeanyoon Choi" />
      <meta name="DC.Subject" content="Multi-Device Web Artwork; Interactive Art; PhD Research" />
      <meta name="DC.Description" content={description} />
      <meta name="DC.Publisher" content="KAIST XD Lab" />
      <meta name="DC.Type" content="Text.Article" />
      <meta name="DC.Format" content="text/html" />

      {/* Enhanced Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content="MDWA PhD Research" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="MDWA Multi-Device Web Artwork PhD Research by Jeanyoon Choi" />
      <meta property="og:locale" content="en_US" />
      <meta property="article:author" content="Jeanyoon Choi" />
      <meta property="article:section" content="Research" />
      <meta property="article:tag" content="Interactive Art" />
      <meta property="article:tag" content="Multi-Device" />
      <meta property="article:tag" content="PhD Research" />

      {/* Enhanced Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@your_twitter" /> {/* Add your Twitter handle */}
      <meta name="twitter:creator" content="@your_twitter" />
      <meta name="twitter:url" content={siteUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content="MDWA Multi-Device Web Artwork PhD Research" />

      {/* Additional Academic Search Engines */}
      <meta name="google-scholar" content="true" />
      <meta name="researchgate" content="true" />
      
      {/* Performance and Accessibility */}
      <meta name="theme-color" content="#1e1e1e" />
      <meta name="msapplication-TileColor" content="#1e1e1e" />
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />

      {/* Enhanced Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Additional Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "MDWA PhD Research",
                "item": siteUrl
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Multi-Device Web Artwork",
                "item": `${siteUrl}#mdwa`
              }
            ]
          })
        }}
      />
    </Head>
  );
};

export default SEO; 