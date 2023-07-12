import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { auth, database } from "../config";
import { child, ref as databaseRef, set } from "firebase/database";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea, CardActions } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import IconButton from "@mui/material/IconButton";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import StarIcon from "@mui/icons-material/Star";
import Search from "../components/SearchBar";
import SharePopperButton from "../components/SharePopperButton";
import Footer from "../components/Footer";

function SearchPage({ isHomePage }) {
  const [searchedRecipes, setSearchedRecipes] = useState([]);
  const [user, setUser] = useState();

  let params = useParams();

  const getSearchResults = async (name) => {
    const data = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.REACT_APP_API_KEY}&query=${name}&number=6`
    );
    const recipes = await data.json();
    setSearchedRecipes(
      recipes.results.map((recipe) => ({
        ...recipe,
        saved: false,
      }))
    );
  };

  useEffect(() => {
    getSearchResults(params.search);
    const currUser = auth.currentUser;
    if (currUser !== null) {
      setUser(currUser);
    }
  }, [params.search]);

  const handleShare = (event, item) => {
    event.preventDefault();
    const recipeURL = `thespork-b06ef.web.app/recipe/${item.id}`;

    if (event.currentTarget.id === "facebook") {
      const link = `https://www.facebook.com/sharer/sharer.php?u=${recipeURL}`;
      window.open(link, "_blank");
    } else if (event.currentTarget.id === "copy") {
      navigator.clipboard.writeText(recipeURL);
    }
  };

  const addFavouriteRecipe = (recipe) => {
    const updatedRecipes = searchedRecipes.map((item) => {
      if (item.id === recipe.id) {
        return {
          ...item,
          saved: !item.saved,
        };
      }
      return item;
    });
    setSearchedRecipes(updatedRecipes);
    const favouritesRef = databaseRef(database, `Users/${user.uid}/favourites`);
    const keyFavRef = child(favouritesRef, `${recipe.id}`);
    set(keyFavRef, { title: recipe.title, imgUrl: recipe.image });
  };

  return (
    <div>
      <Search />
      <Grid container spacing={1}>
        {searchedRecipes.map((item) => (
          <Grid
            xs={6}
            display="flex"
            justifyContent="center"
            alignItems="center"
            key={item.id}
          >
            <motion.div
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              whileHover={{ scale: 1.1 }}
            >
              <Card
                sx={{
                  maxWidth: 345,
                  backgroundColor: "#386150",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(0, 0, 0, 0.2)",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                <CardActionArea component={Link} to={`/recipe/${item.id}`}>
                  <CardMedia component="img" src={item.image} alt="" />
                  <CardContent>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="div"
                      sx={{
                        fontFamily: "gill sans, sans-serif",
                        fontSize: "1.5rem",
                        color: "white",
                      }}
                    >
                      {item.title}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions>
                  <IconButton
                    aria-label="add to favorites"
                    onClick={() => addFavouriteRecipe(item)}
                  >
                    {item.saved ? (
                      <StarIcon sx={{ color: "yellow" }} />
                    ) : (
                      <BookmarkAddIcon />
                    )}
                  </IconButton>
                  <SharePopperButton handleShare={handleShare} item={item} />
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
      {!isHomePage && <Footer />}
    </div>
  );
}

export default SearchPage;
