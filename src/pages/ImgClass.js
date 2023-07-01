import React, { useState } from "react";
import axios from "axios";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { CardActionArea } from "@mui/material";

function ImgClassify() {
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState({});
  const [nutrition, setNutrition] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [info, setInfo] = useState(false);

  const handleChange = (event) => {
    setImageUrl(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (imageUrl !== "") {
      // Make a request from API
      axios
        .get(
          `https://api.spoonacular.com/food/images/analyze?imageUrl=${imageUrl}&apiKey=${process.env.REACT_APP_API_KEY3}`
        )
        .then(function (response) {
          // handle success
          console.log(response.data);
          const results = response.data;
          setCategory(results.category);
          setNutrition(results.nutrition);
          setRecipes(results.recipes);
          setInfo(true);
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
        .finally(function () {
          // always executed
          //setImageUrl("");
        });
    }
  };

  return (
    <div className="container-fluid">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="url-control">Paste image url here</label>
          <input
            type="text"
            className="form-control form-control-lg"
            id="url-control"
            placeholder="Image URL"
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
      <br />
      {imageUrl.trim() !== "" && (
        <img src={imageUrl} alt="food" className="img-thumbnail" style={{width: "50%"}}/>
      )}
      {info === true && (
        <Container>
          <Typography variant="h4" gutterBottom>
            There is a {Math.floor(category.probability * 100)}% chance that
            this is {category.name}.
          </Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Analysed Food</TableCell>
                  <TableCell align="right">Calories</TableCell>
                  <TableCell align="right">Fat&nbsp;(g)</TableCell>
                  <TableCell align="right">Carbs&nbsp;(g)</TableCell>
                  <TableCell align="right">Protein&nbsp;(g)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {category.name}
                  </TableCell>
                  <TableCell align="right">
                    {nutrition.calories.value}
                  </TableCell>
                  <TableCell align="right">{nutrition.fat.value}</TableCell>
                  <TableCell align="right">{nutrition.carbs.value}</TableCell>
                  <TableCell align="right">{nutrition.protein.value}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 4, sm: 8, md: 12 }}
          >
            {Array.from(recipes).map((recipe) => (
              <Grid item xs={2} sm={4} md={4} key={recipe.id}>
                <Card sx={{ maxWidth: 368 }}>
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      height="100%"
                      image={`https://spoonacular.com/recipeImages/${recipe.id}-240x150.${recipe.imageType}`}
                      alt={recipe.title}
                      style={{
                        position: "relative",
                        backgroundColor: "transparent",
                        opacity: "50%",
                      }}
                    />
                    <CardContent
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        height: "100%",
                        width: "100%",
                      }}
                    >
                      <Typography gutterBottom variant="h5" component="div">
                        {recipe.title}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}
    </div>
  );
}

export default ImgClassify;