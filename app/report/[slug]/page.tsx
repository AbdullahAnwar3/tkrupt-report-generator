import { notFound } from 'next/navigation';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Define the expected structure of your AI JSON Output
interface ScorecardData {
  company: string;
  job_title: string;
  decision_maker: string;
  overall_score: number;
  dimensions: Array<{ name: string; score: number; reasoning: string }>;
  improvements: string[];
  summary: string;
}

export default async function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await the dynamic URL parameters (Required in Next.js 15+)
  const { slug } = await params;
  
  // Fetch the data from your serverless database using the slug
  const data: ScorecardData | null = await redis.get(`report:${slug}`);

  // If the URL doesn't exist in the database, show a 404 page
  if (!data) {
    notFound();
  }

  // Render the HTML report
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '40px', color: '#111' }}>
      <header style={{ borderBottom: '2px solid #eaeaea', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 10px 0' }}>Talent Acquisition Scorecard</h1>
        <h2 style={{ fontSize: '20px', color: '#666', fontWeight: '400', margin: '0' }}>{data.company} | {data.job_title}</h2>
      </header>

      <section style={{ backgroundColor: '#f9fafb', padding: '24px', borderRadius: '12px', marginBottom: '40px', border: '1px solid #eaeaea' }}>
        <p style={{ fontSize: '18px', lineHeight: '1.6', margin: '0' }}>{data.summary}</p>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '24px', borderBottom: '1px solid #eaeaea', paddingBottom: '10px' }}>Overall Assessment Score: <span style={{ color: '#0070f3' }}>{data.overall_score}/10</span></h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {data.dimensions && data.dimensions.map((dim, index) => (
            <div key={index} style={{ padding: '20px', border: '1px solid #eaeaea', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{dim.name}</h4>
              <div style={{ fontSize: '36px', fontWeight: '900', color: '#0070f3', marginBottom: '10px' }}>{dim.score}<span style={{fontSize: '16px', color: '#888'}}>/10</span></div>
              <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.5', margin: '0' }}>{dim.reasoning}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ backgroundColor: '#fff', border: '1px solid #eaeaea', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '20px', marginTop: '0', marginBottom: '20px' }}>Strategic Recommendations for Improvement</h3>
        <ul style={{ paddingLeft: '20px', margin: '0' }}>
          {data.improvements && data.improvements.map((improvement, index) => (
            <li key={index} style={{ marginBottom: '12px', fontSize: '16px', lineHeight: '1.5' }}>
              {improvement}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}