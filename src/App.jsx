import "./App.css";
import {
  FormControl,
  InputGroup,
  Container,
  Button,
  Card,
  Row,
  ListGroup,
} from "react-bootstrap";
import { useState, useEffect } from "react";

// ===== Only used for local dev =====
const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // =======================
  // Fetch token from serverless function
  // =======================
  async function fetchServerToken() {
    try {
      const res = await fetch("/api/token");
      const data = await res.json();
      if (data?.access_token) {
        setAccessToken(data.access_token);
      }
    } catch (err) {
      console.error("Failed to fetch server token", err);
    }
  }

  // =======================
  // Dev + Prod token logic
  // =======================
  useEffect(() => {
    if (import.meta.env.DEV && clientId && clientSecret) {
      // Local dev: use client credentials (unsafe in prod)
      let authParams = {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
      };

      fetch("https://accounts.spotify.com/api/token", authParams)
        .then((res) => res.json())
        .then((data) => setAccessToken(data.access_token))
        .catch((err) => console.error(err));
    } else {
      // Production: use serverless token
      fetchServerToken();
    }
  }, []);

  async function fetchSuggestions(query) {
    if (!query.trim() || !accessToken) {
      setSuggestions([]);
      return;
    }

    let params = {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    };

    fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=artist&limit=5`,
      params
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data.artists) {
          setSuggestions([]);
          return;
        }
        setSuggestions(data.artists.items);
      });
  }

  async function search(artistName) {
    if (!accessToken) return;

    let query = artistName || searchInput;
    if (!query.trim()) return;

    let params = {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    };

    const artistID = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=artist`,
      params
    )
      .then((res) => res.json())
      .then((data) => data.artists?.items?.[0]?.id || null);

    if (!artistID) return;

    setSuggestions([]);

    fetch(
      `https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=album&market=US&limit=50`,
      params
    )
      .then((res) => res.json())
      .then((data) => {
        setAlbums(data.items || []);
      });
  }

  function selectSuggestion(name) {
    setSearchInput(name);
    setSuggestions([]);
    search(name);
  }

  return (
    <>
      <Container style={{ position: "relative" }}>
        <InputGroup>
          <FormControl
            placeholder="Search For Artist"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              fetchSuggestions(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && search()}
            style={{
              width: "300px",
              height: "35px",
              borderWidth: "0px",
              borderRadius: "5px",
              marginRight: "10px",
              paddingLeft: "10px",
            }}
          />

          <Button onClick={() => search()}>Search</Button>
        </InputGroup>

        {suggestions.length > 0 && (
          <ListGroup
            style={{
              position: "absolute",
              top: "40px",
              left: "30",
              width: "300px",
              backgroundColor: "black",
              border: "1px solid #ccc",
              borderRadius: "5px",
              zIndex: 1000,
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            {suggestions.map((artist) => (
              <ListGroup.Item
                key={artist.id}
                style={{ cursor: "pointer", textAlign: "left" }}
                onClick={() => selectSuggestion(artist.name)}
              >
                {artist.name}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Container>

      <Container>
        <Row
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-around",
            alignContent: "center",
          }}
        >
          {albums.map((album) => (
            <Card
              key={album.id}
              style={{
                backgroundColor: "white",
                margin: "10px",
                borderRadius: "5px",
                marginBottom: "30px",
              }}
            >
              <Card.Img
                width={200}
                src={album.images[0]?.url}
                style={{ borderRadius: "4%" }}
              />
              <Card.Body>
                <Card.Title
                  style={{
                    fontWeight: "bold",
                    maxWidth: "200px",
                    fontSize: "18px",
                    marginTop: "10px",
                    color: "black",
                  }}
                >
                  {album.name}
                </Card.Title>
                <Card.Text style={{ color: "black" }}>
                  Release Date: <br /> {album.release_date}
                </Card.Text>
                <Button
                  href={album.external_urls.spotify}
                  style={{
                    backgroundColor: "black",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "15px",
                    borderRadius: "5px",
                    padding: "10px",
                  }}
                >
                  Album Link
                </Button>
              </Card.Body>
            </Card>
          ))}
        </Row>
      </Container>
    </>
  );
}

export default App;

// import "./App.css";
// import {
//   FormControl,
//   InputGroup,
//   Container,
//   Button,
//   Card,
//   Row,
//   ListGroup,
// } from "react-bootstrap";
// import { useState, useEffect } from "react";

// const clientId = import.meta.env.VITE_CLIENT_ID;
// const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

// function App() {
//   const [searchInput, setSearchInput] = useState("");
//   const [accessToken, setAccessToken] = useState("");
//   const [albums, setAlbums] = useState([]);
//   const [suggestions, setSuggestions] = useState([]);

//   useEffect(() => {
//     let authParams = {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//       body:
//         "grant_type=client_credentials&client_id=" +
//         clientId +
//         "&client_secret=" +
//         clientSecret,
//     };

//     fetch("https://accounts.spotify.com/api/token", authParams)
//       .then((res) => res.json())
//       .then((data) => setAccessToken(data.access_token));
//   }, []);

//   async function fetchSuggestions(query) {
//     if (!query.trim()) {
//       setSuggestions([]);
//       return;
//     }

//     let params = {
//       method: "GET",
//       headers: {
//         Authorization: "Bearer " + accessToken,
//       },
//     };

//     fetch(
//       "https://api.spotify.com/v1/search?q=" + query + "&type=artist&limit=5",
//       params
//     )
//       .then((res) => res.json())
//       .then((data) => {
//         if (!data.artists) {
//           setSuggestions([]);
//           return;
//         }
//         setSuggestions(data.artists.items);
//       });
//   }

//   async function search(artistName) {
//     let query = artistName || searchInput;
//     if (!query.trim()) return;

//     let params = {
//       method: "GET",
//       headers: {
//         Authorization: "Bearer " + accessToken,
//       },
//     };

//     const artistID = await fetch(
//       "https://api.spotify.com/v1/search?q=" + query + "&type=artist",
//       params
//     )
//       .then((res) => res.json())
//       .then((data) => data.artists.items[0].id || null);

//     if (!artistID) return;

//     setSuggestions([]);

//     fetch(
//       "https://api.spotify.com/v1/artists/" +
//         artistID +
//         "/albums?include_groups=album&market=US&limit=50",
//       params
//     )
//       .then((res) => res.json())
//       .then((data) => {
//         setAlbums(data.items);
//       });
//   }

//   function selectSuggestion(name) {
//     setSearchInput(name);
//     setSuggestions([]);
//     search(name);
//   }

//   return (
//     <>
//       <Container style={{ position: "relative" }}>
//         <InputGroup>
//           <FormControl
//             placeholder="Search For Artist"
//             value={searchInput}
//             onChange={(e) => {
//               setSearchInput(e.target.value);
//               fetchSuggestions(e.target.value);
//             }}
//             onKeyDown={(e) => e.key === "Enter" && search()}
//             style={{
//               width: "300px",
//               height: "35px",
//               borderWidth: "0px",
//               borderRadius: "5px",
//               marginRight: "10px",
//               paddingLeft: "10px",
//             }}
//           />

//           <Button onClick={() => search()}>Search</Button>
//         </InputGroup>

//         {suggestions.length > 0 && (
//           <ListGroup
//             style={{
//             position: "absolute",
//             top: "40px",
//             left: "30",
//             width: "300px",
//             backgroundColor: "black",
//             border: "1px solid #ccc",
//             borderRadius: "5px",
//             zIndex: 1000,
//             boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//       }}

//           >
//             {suggestions.map((artist) => (
//               <ListGroup.Item
//                 key={artist.id}
//                 style={{ cursor: "pointer" ,textAlign:"left"}}
//                 onClick={() => selectSuggestion(artist.name)}
//               >
//                 {artist.name}
//               </ListGroup.Item>
//             ))}
//           </ListGroup>
//         )}
//       </Container>

//       <Container>
//         <Row
//           style={{
//             display: "flex",
//             flexDirection: "row",
//             flexWrap: "wrap",
//             justifyContent: "space-around",
//             alignContent: "center",
//           }}
//         >
//           {albums.map((album) => (
//             <Card
//               key={album.id}
//               style={{
//                 backgroundColor: "white",
//                 margin: "10px",
//                 borderRadius: "5px",
//                 marginBottom: "30px",
//               }}
//             >
//               <Card.Img
//                 width={200}
//                 src={album.images[0].url}
//                 style={{ borderRadius: "4%" }}
//               />
//               <Card.Body>
//                 <Card.Title
//                   style={{
//                     fontWeight: "bold",
//                     maxWidth: "200px",
//                     fontSize: "18px",
//                     marginTop: "10px",
//                     color: "black",
//                   }}
//                 >
//                   {album.name}
//                 </Card.Title>
//                 <Card.Text style={{ color: "black" }}>
//                   Release Date: <br /> {album.release_date}
//                 </Card.Text>
//                 <Button
//                   href={album.external_urls.spotify}
//                   style={{
//                     backgroundColor: "black",
//                     color: "white",
//                     fontWeight: "bold",
//                     fontSize: "15px",
//                     borderRadius: "5px",
//                     padding: "10px",
//                   }}
//                 >
//                   Album Link
//                 </Button>
//               </Card.Body>
//             </Card>
//           ))}
//         </Row>
//       </Container>
//     </>
//   );
// }

// export default App;
