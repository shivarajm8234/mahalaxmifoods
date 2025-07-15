import React from "react";

export function LocationMap() {
  return (
    <div className="w-full">
      <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-[#FF6B35]/20">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.5!2d77.726889!3d13.411833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDI0JzE4LjMiTiA3N8KwNDInMzkuOCJF!5e0!3m2!1sen!2sin!4v1700022206788!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Shree Mahalaxmi Food Products Location"
          aria-label="Map showing location of Shree Mahalaxmi Food Products"
        />
      </div>
    </div>
  );
}
