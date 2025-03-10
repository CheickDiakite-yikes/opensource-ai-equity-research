
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import { MarketNewsArticle } from "@/services/api/marketData/newsService";
import NewsCard from "./NewsCard";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface NewsCarouselProps {
  newsData: MarketNewsArticle[];
}

const NewsCarousel: React.FC<NewsCarouselProps> = ({ newsData }) => {
  return (
    <div className="w-full">
      <Swiper
        modules={[Pagination, Navigation]}
        spaceBetween={16}
        slidesPerView={1}
        pagination={{ clickable: true }}
        navigation={true}
        breakpoints={{
          640: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        }}
        className="mySwiper"
      >
        {newsData.map((article, index) => (
          <SwiperSlide key={`${article.id || index}-${article.headline}`}>
            <NewsCard article={article} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default NewsCarousel;
