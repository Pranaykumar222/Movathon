import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ShareCard from "./ShareCard";

const ShareModal = ({ open, onOpenChange, username, streak, consistency, type, heatmapData = [], startDate }) => {
  const cardRef = useRef(null);
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    try {
      setGenerating(true);
      // Wait a tiny bit to ensure fonts/images are fully rendered
      await new Promise(r => setTimeout(r, 100));
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // High resolution for social media
        useCORS: true,
        backgroundColor: "#06110b",
      });
      
      const image = canvas.toDataURL("image/png");
      
      // Try to use native sharing if available
      if (navigator.share) {
        try {
          const blob = await (await fetch(image)).blob();
          const file = new File([blob], `movathon-${type}.png`, { type: 'image/png' });
          await navigator.share({
            title: 'My Movathon Progress',
            text: 'Check out my consistency on Movathon!',
            files: [file]
          });
          toast.success("Shared successfully!");
          return;
        } catch (err) {
          // Fallback to download if user cancels or share fails
          console.log("Native share failed or cancelled", err);
        }
      }
      
      // Fallback: Download the image
      const link = document.createElement("a");
      link.href = image;
      link.download = `movathon-${type}-stat.png`;
      link.click();
      toast.success("Image saved to your device!");
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate image.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" /> Share your progress
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-4 overflow-hidden">
          {/* We scale it down so it fits in the modal, but html2canvas captures the true size */}
          <div className="w-[450px] h-[800px] origin-top scale-[0.5] sm:scale-[0.6] mb-[-400px] sm:mb-[-320px] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-zinc-800">
            <ShareCard 
              ref={cardRef}
              username={username}
              streak={streak}
              consistency={consistency}
              type={type}
              heatmapData={heatmapData}
              startDate={startDate}
            />
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-col gap-2 mt-2">
          <Button 
            onClick={handleDownload} 
            disabled={generating}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 text-lg transition-transform hover:scale-[1.02]"
          >
            {generating ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating Image...</>
            ) : (
              <><Download className="w-5 h-5 mr-2" /> Save Image for Stories</>
            )}
          </Button>
          <p className="text-center text-xs text-zinc-500 mt-2">
            Perfectly sized for Instagram and Snapchat Stories (1080x1920).
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
