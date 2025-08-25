// app/about/page.tsx
import { Metadata } from 'next';


// SEO metadata for the About Us page
export const metadata: Metadata = {
  title: 'About Us | Design Anything Online',
  description: 'A Kolkata-based store specializing in high-quality customizable products since 2024, with over 1000+ satisfied customers.',
};

export default function AboutPage() {
  return (
    <main>      
      
      {/* Main Content Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg lg:prose-xl text-gray-700 mx-auto">
              <h2 className="text-3xl font-bold text-gray-900">About Our Store</h2>
              <p>
                Welcome to our store! We specialize in selling high-quality customizable products such as T-shirts, mobile covers, coffee mugs, frames, and much more.
              </p>
              <p>
                Since 2024, we have been operating from Kolkata with one clear mission – to satisfy our clients by delivering premium quality products that truly match their personality and style.
              </p>
              <p>
                Our commitment to quality and customer satisfaction has been the cornerstone of our success, helping us build a community of over <strong className="text-gray-800">1000+ happy customers</strong>. We continue to grow every day, ensuring each product we create brings joy and becomes a cherished item.
              </p>
              <blockquote>
                We believe that the best products are a reflection of you. That is why we pour our passion and precision into every order.
              </blockquote>
              
              <h3 className="text-2xl font-bold text-gray-900 mt-12">Our Values</h3>
              <ul>
                <li><strong>Quality First:</strong> We source only the best materials and use top-tier printing techniques.</li>
                <li><strong>Customer Focus:</strong> Your satisfaction is our ultimate goal. We work with you every step of the way.</li>
                <li><strong>Creativity & Innovation:</strong> We are always exploring new products and designs to offer you more ways to express yourself.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}