import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Award, Download, Share2, Facebook, Twitter } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ChallengeCertificateProps {
  challengeTitle: string;
  completedDate: string;
  userName: string;
  durationDays: number;
  rewardPoints: number;
}

const ChallengeCertificate = ({
  challengeTitle,
  completedDate,
  userName,
  durationDays,
  rewardPoints
}: ChallengeCertificateProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      // Create a canvas from the certificate
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = 800;
      canvas.height = 600;

      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, 800, 600);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);

      // Draw border
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, 760, 560);

      // Draw inner border
      ctx.strokeStyle = '#f59e0b40';
      ctx.lineWidth = 2;
      ctx.strokeRect(35, 35, 730, 530);

      // Draw header
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 36px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText('CERTIFICATE OF ACHIEVEMENT', 400, 90);

      // Draw trophy icon placeholder
      ctx.beginPath();
      ctx.arc(400, 160, 40, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 40px Arial';
      ctx.fillText('🏆', 400, 175);

      // Draw "This certifies that"
      ctx.fillStyle = '#e5e7eb';
      ctx.font = '18px Georgia';
      ctx.fillText('This certifies that', 400, 240);

      // Draw user name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Georgia';
      ctx.fillText(userName || 'Challenge Champion', 400, 290);

      // Draw achievement text
      ctx.fillStyle = '#e5e7eb';
      ctx.font = '18px Georgia';
      ctx.fillText('has successfully completed the', 400, 340);

      // Draw challenge name
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 28px Georgia';
      ctx.fillText(challengeTitle, 400, 390);

      // Draw duration
      ctx.fillStyle = '#e5e7eb';
      ctx.font = '16px Georgia';
      ctx.fillText(`${durationDays}-Day Challenge`, 400, 430);

      // Draw points earned
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 20px Georgia';
      ctx.fillText(`+${rewardPoints} Points Earned`, 400, 480);

      // Draw date
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px Georgia';
      ctx.fillText(`Completed on ${format(new Date(completedDate), 'MMMM d, yyyy')}`, 400, 530);

      // Download the image
      const link = document.createElement('a');
      link.download = `${challengeTitle.replace(/\s+/g, '-')}-certificate.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({
        title: 'Certificate Downloaded!',
        description: 'Your achievement certificate has been saved.',
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: 'Download Failed',
        description: 'Could not generate certificate. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareText = `🏆 I just completed the "${challengeTitle}" challenge and earned ${rewardPoints} points! #KetoChallenge #Achievement`;

  const handleShare = async (platform: 'facebook' | 'twitter' | 'native') => {
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: 'Challenge Completed!',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else if (platform === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
        '_blank',
        'width=600,height=400'
      );
    } else if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        '_blank',
        'width=600,height=400'
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Award className="h-4 w-4" />
          <span className="hidden sm:inline">View Certificate</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Your Achievement Certificate
          </DialogTitle>
        </DialogHeader>

        {/* Certificate Preview */}
        <div
          ref={certificateRef}
          className="relative aspect-[4/3] bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border-4 border-yellow-500 p-6 sm:p-8"
        >
          <div className="absolute inset-4 border-2 border-yellow-500/30 rounded-lg" />
          
          <div className="relative h-full flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-yellow-500">
              CERTIFICATE OF ACHIEVEMENT
            </h2>
            
            <div className="bg-yellow-500 rounded-full p-3 sm:p-4">
              <Award className="h-8 w-8 sm:h-12 sm:w-12 text-slate-900" />
            </div>
            
            <p className="text-gray-300 text-sm sm:text-base">This certifies that</p>
            
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              {userName || 'Challenge Champion'}
            </h3>
            
            <p className="text-gray-300 text-sm sm:text-base">has successfully completed the</p>
            
            <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-500">
              {challengeTitle}
            </h4>
            
            <p className="text-gray-400 text-sm">{durationDays}-Day Challenge</p>
            
            <p className="text-green-400 font-bold text-base sm:text-lg">
              +{rewardPoints} Points Earned
            </p>
            
            <p className="text-gray-500 text-xs sm:text-sm">
              Completed on {format(new Date(completedDate), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-4">
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleShare('native')}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleShare('facebook')}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
          >
            <Facebook className="h-4 w-4" />
            <span className="hidden sm:inline">Facebook</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleShare('twitter')}
            className="gap-2 bg-sky-500 hover:bg-sky-600 text-white border-sky-500"
          >
            <Twitter className="h-4 w-4" />
            <span className="hidden sm:inline">Twitter</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeCertificate;
