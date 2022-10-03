AFRAME.registerComponent("markerhandler", {
    init: function(){
        this.el.addEventListener("markerFound", () => {
            console.log("marker found")
            this.markerFound()
        })

        this.el.addEventListener("markerLost", () => {
            console.log("marker lost")
            this.markerLost()
        })
    },

    markerFound: function () {
        var button_div = document.getElementById("button-div")
        button_div.style.display =  "flex"

        var order_button = document.getElementById("order-button")
        var order_summary_button = document.getElementById("order-summary-button")

        order_button.addEventListener("click", () => {
            swal({
                icon: "https://i.imgur.com/4NZ6uLY.jpg",
                title: "Thanks for the order!",
                text: " ",
                timer: 2000,
                buttons: false
            })
        })

        order_summary_button.addEventListener("click", () => {
            swal({
                icon: "warning",
                title: "Order Summary",
                text: "Work In Progress",
            })
        })
    },

    markerLost: function () {
        var button_div = document.getElementById("button-div")
        button_div.style.display =  "none"
    }
})