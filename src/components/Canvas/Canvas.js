import React, { Component } from "react";
import P5Wrapper from "react-p5-wrapper";
import axios from "axios";
import trashIcon from '../../images/trash_icon.svg';
import "./Canvas.css";

// Configure axios with CSRF settings
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;  // Important for CSRF
class Canvas extends Component {
	constructor(props) {
		super(props);
		this.state = {
			drawing: [],
			submitted: false,
			prediction: "",
			canvasLength: localStorage.getItem('width') || 300,
			minLength: 300,
			maxLength: 2000,
			drawings: [],
			predictionProgress: '',
			predBtnCountdown: 0,
			showCanvas: false,
			uploadedImage: null // New state to store uploaded image
		};
		this.sketch = this.sketch.bind(this);
		this.fileUploadHandler = this.fileUploadHandler.bind(this);
		this.handleImageUpload = this.handleImageUpload.bind(this); // New method for image upload
		this.handleSubmitPrediction = this.handleSubmitPrediction.bind(this);
		this.handleOnClickDelete = this.handleOnClickDelete.bind(this);
		this.handleUseCanvas = this.handleUseCanvas.bind(this);
	}

	async fileUploadHandler(img) {
		this.setState({ predictionProgress: 'Preprocessing...' }, () => {
			setTimeout(() => {
				this.setState({ predictionProgress: 'Prediction Ongoing...' });
			}, 2000);
		});

		function dataURItoBlob(dataURI) {
			var byteString;
			if (dataURI.split(",")[0].indexOf("base64") >= 0)
				byteString = atob(dataURI.split(",")[1]);
			else byteString = unescape(dataURI.split(",")[1]);
			
			var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
			var ia = new Uint8Array(byteString.length);
			for (var i = 0; i < byteString.length; i++) {
				ia[i] = byteString.charCodeAt(i);
			}
			return new Blob([ia], { type: mimeString });
		}

		var canvasInput = document.getElementById("defaultCanvas0");
		var canvasImg = canvasInput.toDataURL();
		var file = dataURItoBlob(canvasImg);

		const fd = new FormData();
		fd.append("image", file);

		var response = await axios.post("handwriting/", fd, {
			headers: {
				"content-type": "multipart/form-data"
			}
		});

		this.setState({
			prediction: response.data,
			predictionProgress: '',
		});

		const secCountdown = function () {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					resolve()
				}, 1000)
			})
		}

		async function init() {
			try {
				await secCountdown()
			}
			catch (err) {
				console.log('error: ', err)
			}
		}

		let time = 5

		this.setState({
			predBtnCountdown: time
		})

		do {
			await init()
			time--
			this.setState({
				predBtnCountdown: time
			})
			
		} while(time > 0)
	}

	handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.setState({ 
                uploadedImage: file, 
                predictionProgress: 'Processing uploaded image...' 
            }, async () => {
                try {
                    // First, get the CSRF token
                    const csrfResponse = await axios.get('/get-csrf-token/');  // You'll need to create this endpoint
                    const csrfToken = csrfResponse.data.csrfToken;

                    const fd = new FormData();
                    fd.append("image", file);

                    // Make the upload request with CSRF token
                    const response = await axios.post("uploaded_image/", fd, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            'X-CSRFToken': csrfToken
                        },
                        withCredentials: true
                    });

                    this.setState({
                        prediction: response.data,
                        predictionProgress: '',
                    });
                } catch (error) {
                    console.error("Error uploading image:", error);
                    console.log("Error details:", error.response?.data);
                    this.setState({ 
                        predictionProgress: 'Error processing image. Please try again.' 
                    });
                }
            });
        }
    }

	sketch = p => {
		var canvas;
		var drawings = this.state.drawings;

		var drawingStorage = localStorage.getItem('drawings')
		if (drawingStorage !== null && drawingStorage.length !== 0) {
			drawingStorage = JSON.parse(localStorage.getItem('drawings'))
			
			for (let i = 0; i < drawingStorage.length; i++) {
				drawings.push(drawingStorage[i])
			}
		}

		var currentPath = [];
		var isDrawing = false;
		p.setup = () => {
			canvas = p.createCanvas(this.state.canvasLength, 200);
			p.noStroke();
			canvas.mousePressed(p.startPath);
			canvas.touchStarted(p.startPath)
			canvas.mouseReleased(p.endPath);
			canvas.touchEnded(p.endPath)
		};

		p.startPath = () => {
			isDrawing = true;
			currentPath = [];
			drawings.push(currentPath);
			this.setState({
				drawings: drawings
			})

			var canvasHTML = document.getElementById("defaultCanvas0");

			document.body.addEventListener("touchstart", function (e) {
				if (e.target === canvasHTML) {
					console.log('inside touchstart')
					e.preventDefault();
				}
			}, { passive: false });
			document.body.addEventListener("touchend", function (e) {
				if (e.target === canvasHTML) {
					e.preventDefault();
				}
			}, { passive: false });
			document.body.addEventListener("touchmove", function (e) {
				if (e.target === canvasHTML) {
					e.preventDefault();
				}
			}, { passive: false });

		};

		p.endPath = () => {
			isDrawing = false;
		};

		p.draw = () => {
			var px = p.mouseX
			var py = p.mouseY;
			p.background(0);

			if (isDrawing) {
				let point = {
					x1: px,
					y1: py,
					x2: p.mouseX,
					y2: p.mouseY
				};
				currentPath.push(point);
			}
			drawings = this.state.drawings
			for (let i = 0; i < drawings.length; i++) {
				let path = drawings[i];
				if (drawings[i].length !== 0) {
					p.beginShape();
					for (let j = 0; j < path.length; j++) {
						p.strokeWeight(15)
						p.stroke(255);
						p.noFill()

						if (window.innerWidth <= 760) {
							//mob
							p.vertex(path[j].x2, path[j].y2);
						} else {
							//dskt
							p.line(path[j].x1, path[j].y1, path[j].x2, path[j].y2);
						}
					}
					p.endShape();
				}
			}

			if (this.state.submitted === true) {
				console.log("we are ready to export");
				this.setState({
					submitted: false
				});
				const img = canvas.get();

				this.fileUploadHandler(img);
			}
		};
	};

	handleSubmitPrediction = e => {
		e.preventDefault();
		this.setState({
			submitted: true
		});
	};

	handleOnClickDelete = e => {
		this.setState({
			drawings: [],
			prediction: ''
		})
	}

	handleUseCanvas = () => {
		this.setState({ showCanvas: true });
	}

	render() {
		const disablePredBtn = this.state.predictionProgress === '' 
			&& this.state.predBtnCountdown === 0 ? false : true

		const predCountdown = this.state.predBtnCountdown === 0 ? '' : `: ${this.state.predBtnCountdown}`

		return (
			<div className="canvas">
				{!this.state.showCanvas ? (
					<button
						className="btn waves-effect waves-light blue darken-1 use-canvas"
						onClick={this.handleUseCanvas}
					>Use Canvas</button>
				) : (
					<>
						<div className="toolbar">
							<img className="trashIcon"
								src={trashIcon}
								alt=""
								onClick={this.handleOnClickDelete}>
							</img>
							<input
								type="file"
								accept="image/*"
								onChange={this.handleImageUpload}
								style={{ display: 'none' }}
								id="fileInput"
							/>
							<label htmlFor="fileInput" className="btn waves-effect waves-light blue darken-1">
								Upload Image
							</label>
						</div>

						<div className="p5-canvas">
							<P5Wrapper className="P5Wrapper" sketch={this.sketch} />
						</div>

						<button
							className="btn waves-effect waves-light blue darken-1 submit-prediction"
							type="submit"
							name="action"
							onClick={this.handleSubmitPrediction}
							disabled={disablePredBtn}
						>Predict{predCountdown}</button>

						{this.state.predictionProgress ? (
							<div className="waiting-for-prediction">
								<h5>{this.state.predictionProgress}</h5>
								<div className="progress">
									<div className="indeterminate blue darken-1"></div>
								</div>
							</div>
						) : (
								<h5 className="prediction-result">{this.state.prediction}</h5>
							)}
					</>
				)}
			</div>
		);
	}
}

export default Canvas;