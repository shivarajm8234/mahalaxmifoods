import * as React from "react";
import { toast } from "@/hooks/use-toast";
import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
const EMAILJS_SERVICE_ID = 'service_q9z4isp'; // Replace with your EmailJS service ID
const EMAILJS_TEMPLATE_ID = 'template_j0upuvs'; // Replace with your EmailJS template ID
const EMAILJS_PUBLIC_KEY = '0DnCEAKe0hTLOZZS0'; // Replace with your EmailJS public key

export function ContactSection() {
  const [form, setForm] = React.useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = React.useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!form.name || !form.email || !form.message) {
      toast({
        title: "Please fill all fields.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast({
        title: "Invalid email address",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Initialize EmailJS with public key
      emailjs.init(EMAILJS_PUBLIC_KEY);
      
      // Send email using EmailJS
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          to_email: 'shreemahalaxmi.product@gmail.com',
          message: form.message,
          reply_to: form.email
        }
      );

      // Show success message
      toast({
        title: "Thank you!",
        description: "Your message has been sent. We'll get back to you soon!",
      });

      // Reset form
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-[#F9F7F1] to-white">
      <div className="max-w-2xl mx-auto px-5">
        <h2 
          className="text-4xl font-playfair font-bold text-gray-800 mb-12 text-center"
          data-aos="fade-down"
        >
          Contact Us
        </h2>
        <div 
          className="bg-white rounded-2xl shadow-lg p-8"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <form 
            onSubmit={onSubmit} 
            className="space-y-6"
          >
          <input
            type="text"
              id="name"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Your Name"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFA500] focus:border-transparent outline-none transition-all bg-white placeholder-gray-400"
              required
          />
          <input
            type="email"
              id="email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="Your Email"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFA500] focus:border-transparent outline-none transition-all bg-white placeholder-gray-400"
              required
          />
          <textarea
              id="message"
            name="message"
            value={form.message}
            onChange={onChange}
            placeholder="Your Message"
            rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFA500] focus:border-transparent outline-none transition-all bg-white placeholder-gray-400 resize-none"
              required
          />
          <button
            type="submit"
            disabled={loading}
              className="w-full bg-[#D7263D] text-white py-4 rounded-lg font-semibold hover:bg-[#FF6B35] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
        </div>
      </div>
    </section>
  );
}
