import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Imprint = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Imprint (Impressum)</h1>
        
        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Information according to § 5 TMG</h2>
            <p>
              Ketopia<br />
              [Company Address Line 1]<br />
              [City, Postal Code]<br />
              [Country]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Contact</h2>
            <p>
              Email: support@ketopia.online<br />
              Website: https://ketopia.online
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">VAT Identification Number</h2>
            <p>
              VAT ID according to §27a of the German VAT Act:<br />
              [Your VAT ID]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Responsible for Content</h2>
            <p>
              [Name of responsible person]<br />
              [Address]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">EU Dispute Resolution</h2>
            <p>
              The European Commission provides a platform for online dispute resolution (OS): 
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
            <p>
              We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Payment Processing</h2>
            <p>
              Payments are processed securely by Digistore24 GmbH, St.-Godehard-Straße 32, 31139 Hildesheim, Germany.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Imprint;
