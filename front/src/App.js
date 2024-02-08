
import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";

function App() {
  const [canvas, setCanvas] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas("canvas");
    setCanvas(fabricCanvas);
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);

      // Display the selected image in the canvas
      fabric.Image.fromURL(imageUrl, function (img) {
        imgRef.current = img;
        console.log("Image Dimensions:", img.width, img.height);

        // Set canvas dimensions to match the image
        canvas.setDimensions({
          width: img.width,
          height: img.height,
        });

        // Log canvas dimensions
        console.log("Canvas Dimensions:", canvas.width, canvas.height);

        img.set({ left: 0, top: 0 });

        // Remove existing mattress object
        if (canvas && canvas.getObjects().length > 0) {
          canvas.remove(canvas.getObjects()[0]);
        }

        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));

        // Send the selected image to the backend
        const formData = new FormData();
        formData.append("image", file);

        fetch("http://localhost:3001/api/generate-svg", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            const svgPath = data.svgPath;
            console.log("SVG Path:", svgPath);

            // Create fabric object using SVG path and add it to the canvas
            if (canvas) {
              const mattress = new fabric.Path(svgPath, {
                fill: "#282828",
                opacity: 0.7,
              });

              console.log(
                "Mattress Dimensions:",
                mattress.width,
                mattress.height
              );

              canvas.add(mattress);
            } else {
              console.error("Error: Canvas is not defined.");
            }
          })
          .catch((error) => {
            console.error("Error fetching SVG path:", error);
          });
      });
    }
  };

  const changeColor = (color, alpha) => {
    if (canvas && canvas.getObjects().length > 0) {
      const mattressObject = canvas.getObjects()[0];

      if (mattressObject && mattressObject.set) {
        mattressObject.set({
          fill: color,
          opacity: alpha,
        });

        canvas.renderAll();
      } else {
        console.error(
          "Error: mattressObject is not defined or does not have a set method"
        );
      }
    } else {
      console.error("Error: canvas is not defined or has no objects");
    }
  };

  return (
    <div>
      <h1>Your React App</h1>
      <div>
        <input type="file" onChange={handleImageChange} />
      </div>
      <div style={{ position: "relative" }}>
        <canvas id="canvas"></canvas>
        <div style={{ position: "absolute", top: 500, left: 0, width: "100%" }}>
          <button onClick={() => changeColor("green", 0.6)}>
            Green (Transparent)
          </button>
          <button onClick={() => changeColor("#046489", 0.6)}>
            Blue (Transparent)
          </button>
          <button onClick={() => changeColor("#60371", 0.6)}>
            Black (Transparent)
          </button>
          <button onClick={() => changeColor("#f34976", 0.6)}>
            Pink (Transparent)
          </button>
          <button onClick={() => changeColor("#5e3a8c", 0.6)}>
            Purple (Transparent)
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
