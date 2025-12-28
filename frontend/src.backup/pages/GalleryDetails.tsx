import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import galaryDetails from "../static/galaryDetail";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const GalleryDetails = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);

  const details = galaryDetails.find((details) => details.id === parseInt(id || '0'));

  useGSAP(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5 });
    }
  }, { scope: containerRef });

  useGSAP(() => {
    if (mainImageRef.current) {
      gsap.fromTo(mainImageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    }
  }, [selectedImage]);


  const { contextSafe } = useGSAP({ scope: containerRef });

  const handleHoverEnter = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2 });
  });

  const handleHoverLeave = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { scale: 1, duration: 0.2 });
  });

  const handleTap = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
  });


  if (!details) {
    return <div>Not found</div>;
  }

  const handleImageClick = (index: number) => {
    setSelectedImage(index);
  };

  return (
    <div className="pt-20 min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-12 ">
        <div className="gap-12 w-full ">
          {/* Main Image and Gallery */}
          <div
            ref={containerRef}
            className="space-y-6 "
            style={{ opacity: 0 }} // Initial state
          >
            <div
              ref={mainImageRef}
              key={selectedImage}
              className="bg-white p-4 rounded-lg shadow-lg "
            >
              <img
                src={details.images[selectedImage]}
                alt={`${details.title} - View ${selectedImage + 1}`}
                className="w-full h-[500px] object-contain   rounded-lg"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {details.images.map((image, index) => (
                <div
                  key={index}
                  className={`cursor-pointer relative rounded-lg overflow-hidden ${selectedImage === index ? "ring-2 ring-accent" : ""
                    }`}
                  onClick={() => handleImageClick(index)}
                  onMouseEnter={handleHoverEnter}
                  onMouseLeave={handleHoverLeave}
                  onMouseDown={handleTap}
                >
                  <img
                    src={image}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                  {selectedImage === index && (
                    <div className="absolute inset-0 bg-accent/20" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Project Details */}
          {/* Empty div in original code? Keeping simplified structure as requested */}
          <div className="space-y-8"></div>
        </div>
      </div>
    </div>
  );
};

export default GalleryDetails;
