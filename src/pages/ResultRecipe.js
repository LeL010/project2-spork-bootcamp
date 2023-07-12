import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "../components/Footer";

const DetailWrapper = styled(motion.div)`
  margin-top: 1rem;
  margin-bottom: 1rem;
  margin-left: 3rem;
  display: flex;
  .active {
    background: linear-gradient(35deg, #494949, #313131);
    color: white;
  }
  h2 {
    margin-bottom: 2rem;
  }
  li {
    font-size: 1rem;
    line-height: 2rem;
  }
  ul {
    margin-top: 2rem;
  }
`;

const StyledButton = styled(motion.button)`
  padding: 0.5rem 1rem;
  color: #313131;
  background: white;
  border: 2px #615038;
  margin-right: 2rem;
  font-weight: 600;
  font-family: gill sans, sans-serif;
  border-radius: 8px;
`;

const Info = styled.div`
  margin-left: 8rem;
`;

const StyledInstructions = styled.h3`
  text-align: left;
  margin-top: 2rem;
  margin-right: 3rem;
  font-size: 1.2rem;
  font-family: gill sans, sans-serif;
  a {
    color: yellow;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;

const StyledIngredients = styled.h3`
  text-align: left;
  margin-top: 2rem;
  margin-right: 1rem;
`;

const StyledImage = styled(motion.img)`
  border-radius: 2rem;
  &:hover {
    transform: scale(1.1);
  }
`;

const StyledList = styled.ul`
  text-align: left;
  margin-left: 2rem;
  padding-left: 0rem;
  font-size: 20rem;
  font-family: gill sans, sans-serif;
`;

function ResultRecipe() {
  const [details, setDetails] = useState({});
  const [activeTab, setActiveTab] = useState("Instructions");
  let { recipeName } = useParams();

  useEffect(() => {
    const fetchResultRecipe = async () => {
      try {
        const response = await axios.get(
          `https://api.spoonacular.com/recipes/${recipeName}/information?apiKey=${process.env.REACT_APP_API_KEY}`
        );
        const recipe = response.data;
        setDetails(recipe);
      } catch (error) {
        console.error("Error fetching recipe:", error);
      }
    };

    fetchResultRecipe();
  }, [recipeName]);

  return (
    <div>
      <DetailWrapper
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div whileHover={{ scale: 1.25 }}>
          <h2>{details.title}</h2>
          <StyledImage src={details?.image} alt="" />
        </motion.div>
        <Info>
          <StyledButton
            style={{ marginRight: "1rem" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={activeTab === "instructions" ? "active" : ""}
            onClick={() => setActiveTab("instructions")}
          >
            Instructions
          </StyledButton>
          <StyledButton
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={activeTab === "ingredients" ? "active" : ""}
            onClick={() => setActiveTab("ingredients")}
          >
            Ingredients
          </StyledButton>
          <br />
          {activeTab === "instructions" && (
            <motion.div
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StyledInstructions
                dangerouslySetInnerHTML={{ __html: details.summary }}
              ></StyledInstructions>
              <StyledInstructions
                dangerouslySetInnerHTML={{ __html: details.instructions }}
              ></StyledInstructions>
            </motion.div>
          )}
          {activeTab === "ingredients" && (
            <motion.div
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StyledIngredients></StyledIngredients>
              <StyledList>
                {details.extendedIngredients?.map((ingredient) => (
                  <li key={ingredient.id}>{ingredient.original}</li>
                ))}
              </StyledList>
            </motion.div>
          )}
        </Info>
      </DetailWrapper>
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default ResultRecipe;
