
import React from 'react';
import { Star } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Sample review data
const reviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    company: "Tech Solutions LLC",
    rating: 5,
    text: "The team at Tabadl Alkon made the process of registering our business in Saudi Arabia incredibly smooth. Their professional guidance saved us countless hours and potential headaches.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 2,
    name: "Ahmed Al-Farsi",
    company: "Gulf Investments",
    rating: 5,
    text: "I cannot recommend Tabadl Alkon highly enough. Their deep knowledge of Saudi regulations and requirements was invaluable to our business expansion.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 3,
    name: "Lisa Chen",
    company: "Global Trade Partners",
    rating: 4,
    text: "From our first consultation to the final registration approval, the entire process was efficient and transparent. Tabadl Alkon's team went above and beyond to meet our specific needs.",
    image: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 4,
    name: "Omar Khalid",
    company: "Desert Innovation Group",
    rating: 5,
    text: "As a first-time business owner in Saudi Arabia, the guidance and support I received from Tabadl Alkon was invaluable. They simplified complex regulations and made the entire process approachable.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 5,
    name: "Fatima Al-Saud",
    company: "Riyadh Consulting",
    rating: 5,
    text: "The team's attention to detail and proactive communication made all the difference. They anticipated issues before they arose and ensured our business registration proceeded without delays.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80"
  }
];

const renderStars = (rating: number) => {
  return Array(5).fill(0).map((_, i) => (
    <Star 
      key={i} 
      className={`h-5 w-5 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
    />
  ));
};

export const Reviews: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-3 text-blue-800">Client Testimonials</h2>
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          See what our clients have to say about their experience working with Tabadl Alkon to register and grow their businesses in Saudi Arabia.
        </p>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent>
            {reviews.map((review) => (
              <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="mr-4">
                      <img 
                        src={review.image} 
                        alt={review.name} 
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold">{review.name}</h4>
                      <p className="text-sm text-gray-600">{review.company}</p>
                      <div className="flex mt-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  <p className="text-left text-gray-700 flex-grow">{review.text}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </Carousel>
      </div>
    </section>
  );
};
