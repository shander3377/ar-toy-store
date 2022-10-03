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
            console.log("PLEASEEEEEE")
            console.log(uid)
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
            console.log("please")
			swal({
				icon: "warning",
				title: toy.toy_name.toUpperCase(),
				text: "This toy is out of stock!!!",
				timer: 2500,
				buttons: false,
			});
		} else {
            console.log("damn")
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

			order_summary_button.addEventListener("click", () => {
				swal({
					icon: "warning",
					title: "Order Summary",
					text: "Work In Progress",
				});
			});
		}
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
                console.log(toy.price)
                console.log(typeof(toy.price))
				details.total_bill += toy.price;

				firebase.firestore().collection("users").doc(doc.id).update(details);
			});
	},
	markerLost: function () {
		var button_div = document.getElementById("button-div");
		button_div.style.display = "none";
	},
});
