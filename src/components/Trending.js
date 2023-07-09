import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styled from "styled-components";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/banner.png";

function Trending() {
  const [recipes, setRecipes] = useState([]);
  const splideRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://api.spoonacular.com/recipes/random?apiKey=${process.env.REACT_APP_API_KEY}&number=6`
        );
        console.log(response.data);

        setRecipes(response.data.recipes);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchData();
  }, []);

  const Wrapper = styled.div`
    margin: 0;
    padding: 0;
  `;

  const LogoWrapper = styled.div`
    display: flex;
    justify-content: center;
    margin-top: -4rem;
    padding: 0;
  `;

  const Logo = styled.img`
    width: 100%;
    max-width: 100%;
    height: auto;
    margin-bottom: 0rem;
    padding: 0;
    border-radius: 10rem;
  `;

  const Card = styled.div`
    min-height: 25rem;
    border-radius: 2rem;
    overflow: hidden;
    position: relative;

    img {
      border-radius: 2rem;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    p {
      position: absolute;
      z-index: 10;
      left: 50%;
      bottom: 0%;
      transform: translate(-50%, 0%);
      color: white;
      width: 100%;
      text-align: center;
      font-weight: 300;
      font-size: 1.25rem;
      font-family: "Gill Sans", sans-serif;
      height: 10%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `;

  const Gradient = styled.div`
    z-index: 3;
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5));
  `;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        splideRef.current.options = {
          perPage: 1,
          pagination: false,
          drag: true,
          gap: "1rem",
        };
      } else {
        splideRef.current.options = {
          perPage: 3,
          pagination: false,
          drag: "free",
          gap: "1rem",
        };
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const HeadingContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  `;

  const HeadingText = styled.h2`
    margin-top: -7rem;
  `;

  const SubHeadingText = styled.h1`
    margin-left: 2rem;
    margin-bottom: 1rem;
    text-align: left;
  `;

  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <LogoWrapper>
        <Logo src={logo} alt="Logo" />
      </LogoWrapper>
      <HeadingContainer>
        <HeadingText></HeadingText>
      </HeadingContainer>
      <SubHeadingText>Popular Picks Today!</SubHeadingText>
      <Wrapper>
        <Splide
          options={{
            perPage: 3,
            pagination: false,
            arrows: true,
            drag: "free",
            gap: "1rem",
          }}
          ref={splideRef}
        >
          {recipes.map((recipe) => (
            <SplideSlide key={recipe.id}>
              <Card key={recipe.id}>
                <Link to={"/recipe/" + recipe.id}>
                  <p>{recipe.title}</p>
                  <img src={recipe.image} alt={recipe.title} />
                </Link>
                <Gradient />
              </Card>
            </SplideSlide>
          ))}
        </Splide>
      </Wrapper>
    </motion.div>
  );
}

export default Trending;
