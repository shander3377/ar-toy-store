var uid = null;
AFRAME.registerComponent("markerhandler", {
	getToys: async function () {
		return await firebase
			.firestore()
			.collection("toys")
			.get()
			.then((snap) => {
				return snap.docs.map((doc) => doc.data());
			});
	},
	init: async function () {
		if (uid === null) {
			this.askUserId();
		}
		var toys = await this.getToys();
		this.el.addEventListener("markerFound", () => {
			console.log("PLEASEEEEEE");
			console.log(uid);
			if (uid !== null) {
				console.log("marker found");

				var markerid = this.el.id;
				this.markerFound(toys, markerid);
			}
		});

		this.el.addEventListener("markerLost", () => {
			console.log("marker lost");
			this.markerLost();
		});
	},

	askUserId: async function () {
		swal({
			icon: "https://raw.githubusercontent.com/whitehatjr/ar-toy-store-assets/master/toy-shop.png",
			title: "Welcome to Toy Shop!",
			content: {
				element: "input",
				attributes: {
					placeholder: "Type your UID ex. U01",
				},
			},
		}).then((inputvalue) => {
			uid = inputvalue.toUpperCase();
		});
	},

	markerFound: function (toys, markerid) {
		var toy = toys.filter((toy) => toy.id == markerid)[0];

		if (toy.is_outofstock) {
			console.log("please");
			swal({
				icon: "warning",
				title: toy.toy_name.toUpperCase(),
				text: "This toy is out of stock!!!",
				timer: 2500,
				buttons: false,
			});
		} else {
			console.log("damn");
			var model = document.querySelector(`#model-${toy.id}`);
			model.setAttribute("visible", true);

			// make plane Container visible
			var mainPlane = document.querySelector(`#main_plane-${toy.id}`);
			mainPlane.setAttribute("visible", true);

			var button_div = document.getElementById("button-div");
			button_div.style.display = "flex";

			var order_button = document.getElementById("order-button");
			var order_summary_button = document.getElementById(
				"order-summary-button"
			);
			var rating_button = document.getElementById("rating-button");
			rating_button.addEventListener("click", () => {
				this.handleRatings(toy);
			});
			order_button.addEventListener("click", () => {
				this.handlerOrder(uid, toy);
				swal({
					icon: "https://i.imgur.com/4NZ6uLY.jpg",
					title: "Thanks for the order!",
					text: " ",
					timer: 2000,
					buttons: false,
				});
			});
			var payButton = document.getElementById("pay-button");
			payButton.addEventListener("click", () => {
				console.log("b clicked");
				this.handlePayment();
			});
			order_summary_button.addEventListener("click", () => {
				this.handlerOrderSummary();
			});
		}
	},
	handleRatings: async function (toy) {
		document.getElementById("rating-modal-div").style.display = "flex";
		console.log(window.getComputedStyle(document.getElementById("rating-modal-div")))
		document.getElementById("rating-input").value = "0";
		var saveRatingButton = document.getElementById("save-rating-button");
		var closeButton = document.getElementById("rating-close-button")
		closeButton.addEventListener("click", () => {
			console.log("Close clciked")
			document.getElementById("rating-modal-div").style.display = "none";
			
		})
		saveRatingButton.addEventListener("click", async () => {
			document.getElementById("rating-modal-div").style.display = "none";
			var rating = document.getElementById("rating-input").value;

			await firebase.firestore()
				.collection("toys")
				.doc(toy.id)
				.update({ rating: rating })
				.then(() => {
					swal({
						icon: "success",
						title: "Thanks for the rating!",
						text: "We Hope you liked the toy!",
						timer: 2500,
						buttons: false,
					});
				});
		});
	},
	handlerOrder: function (uid, toy) {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.get()
			.then((doc) => {
				var details = doc.data();

				if (details["current_orders"][toy.id]) {
					details["current_orders"][toy.id]["quantity"] += 1;

					var currentQuantity = details["current_orders"][toy.id]["quantity"];

					var price = details["current_orders"][toy.id]["price"];
					var subtotal = price * currentQuantity;

					details["current_orders"][toy.id][subtotal] = subtotal;
				} else {
					details["current_orders"][toy.id] = {
						item: toy.name,
						price: toy.price,
						quantity: 1,
						subtotal: toy.price * 1,
					};
				}
				console.log(toy.price);
				console.log(typeof toy.price);
				details.total_bill += toy.price;

				firebase.firestore().collection("users").doc(doc.id).update(details);
			});
	},
	get_order_summary: async function () {
		var orderSummary = await firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.get()
			.then((doc) => doc.data());
		return orderSummary;
	},
	handlePayment: async function () {
		document.getElementById("modal-div").style.display = "none";

		await firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.update({
				current_orders: {},
				total_bill: 0,
			})
			.then(() => {
				swal({
					icon: "success",
					title: "Payment Done",
					text: "Please visit us again!",
					timer: 2000,
					buttons: false,
				});
			});
	},
	handlerOrderSummary: async function () {
		var data = await this.get_order_summary();
		console.log(data);

		var modal_div = document.getElementById("modal-div");
		modal_div.style.display = "flex";
		var tableBodyTag = document.getElementById("bill-table-body");
		tableBodyTag.innerHTML = "";

		var current_orders = await data.current_orders;
		console.log(current_orders);
		console.log(typeof current_orders);
		for (const order in current_orders) {
			var tr = document.createElement("tr");
			var item = document.createElement("td");
			var price = document.createElement("td");
			var quantity = document.createElement("td");
			var subtotal = document.createElement("td");
			item.innerHTML = data.current_orders[order].item;
			price.innerHTML = "$" + data.current_orders[order].price;
			price.setAttribute("class", "text-center");
			quantity.setAttribute("class", "text-center");
			subtotal.setAttribute("class", "text-center");
			quantity.innerHTML = data.current_orders[order].quantity;
			subtotal.innerHTML = data.current_orders[order].subtotal;

			tr.appendChild(item);
			tr.appendChild(subtotal);
			tr.appendChild(price);
			tr.appendChild(quantity);
			tableBodyTag.appendChild(tr);
		}

		// current_orders.forEach((i) => {
		// 	var tr = document.createElement("tr");
		// 	var item = document.createElement("td");
		// 	var price = document.createElement("td");
		// 	var quantity = document.createElement("td");
		// 	var subtotal = document.createElement("td");
		// 	item.innerHTML = data.current_orders[i].item;
		// 	price.innerHTML = "$" + data.current_orders[i].price;
		// 	price.setAttribute("class", "text-center");
		// 	quantity.setAttribute("class", "text-center");
		// 	subtotal.setAttribute("class", "text-center");
		// 	quantity.innerHTML = data.currentQuantity[i].quantity;
		// 	subtotal.innerHTML = data.currentQuantity[i].subtotal;

		// 	tr.appendChild(item);
		// 	tr.appendChild(subtotal);
		// 	tr.appendChild(price);
		// 	tr.appendChild(quantity);
		// 	tableBodyTag.appendChild(tr);
		// });

		var total_rows = document.createElement("tr");

		var td1 = document.createElement("td");
		var td2 = document.createElement("td");
		var td3 = document.createElement("td");
		var td4 = document.createElement("td");

		td1.setAttribute("class", "no-line");
		td2.setAttribute("class", "no-line");
		td3.setAttribute("class", "text-center no-line");

		var strong = document.createElement("strong");
		strong.innerHTML = "Total";
		td3.appendChild(strong);
		td4.setAttribute("class", "text-right no-line");
		td4.innerHTML = "$" + data.total_bill;

		total_rows.appendChild(td1);
		total_rows.appendChild(td2);
		total_rows.appendChild(td3);
		total_rows.appendChild(td4);

		tableBodyTag.appendChild(total_rows);

		var closeButton = document.getElementById("summary-close-button")
		closeButton.addEventListener("click", () => {
			document.getElementById("modal-div").style.display = "none";
			
		})
	},

	markerLost: function () {
		var button_div = document.getElementById("button-div");
		button_div.style.display = "none";
	},
});
