import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Imprint: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl text-muted-foreground">
        <h1 className="text-3xl font-bold mb-8 text-foreground">
          Imprint (Impressum)
        </h1>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Information according to § 5 TMG
          </h2>

          <p><strong>Website Owner:</strong><br />Ketopia</p>

          <p><strong>Company Name:</strong><br />Ketopia Solutions Pvt. Ltd.</p>

          <p>
            <strong>Registered Address:</strong><br />
           3051 N D St San Bernardino, California(CA), 92405
          </p>

          <p><strong>Registration Number:</strong><br />NA</p>

          <p><strong>Represented by:</strong><br />Kartikey Raturi</p>
        </section>

        <hr className="my-6" />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Contact Information
          </h2>

          <p><strong>Email:</strong> sankhobusiness@gmail.com</p>
          <p><strong>Phone:</strong> +8368347127</p>
        </section>

        <hr className="my-6" />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            VAT / Tax Information
          </h2>

          <p><strong>GST Number:</strong><br />NA</p>
        </section>

        <hr className="my-6" />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Disclaimer
          </h2>

          <h3 className="font-semibold text-foreground">
            Liability for Content
          </h3>
          <p>
            The contents of our website have been created with the utmost care.
            However, we cannot guarantee the accuracy, completeness, or
            timeliness of the content.
          </p>

          <h3 className="font-semibold text-foreground">
            Liability for Links
          </h3>
          <p>
            Our website may contain links to external websites. We have no
            control over the content of those websites and therefore cannot
            accept any liability for them.
          </p>
        </section>

        <hr className="my-6" />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Affiliate Disclosure
          </h2>

          <p>
            Some links on this website are affiliate links. This means we may
            earn a commission if you purchase through these links at no
            additional cost to you.
          </p>
        </section>

        <hr className="my-6" />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Online Dispute Resolution
          </h2>

          <p>
            The European Commission provides a platform for online dispute
            resolution (ODR):
          </p>

          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
        </section>

        <hr className="my-6" />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Copyright Notice
          </h2>

          <p>
            All content on this website (texts, images, graphics) is subject to
            copyright laws. Unauthorized use is prohibited.
          </p>
        </section>

        <hr className="my-6" />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Important Note
          </h2>

          <p>
            This imprint is valid for all services offered on this website,
            including digital products, subscriptions, and affiliate promotions.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Imprint;
