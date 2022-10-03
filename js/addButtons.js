AFRAME.registerComponent("createbuttons", {
    init: function(){
        var buttonDiv = document.getElementById("button-div")
        
        var button1 = document.createElement("button")
        button1.setAttribute("id", "order-button")
        button1.setAttribute("class", "btn btn-danger ml-3 mr-3")
        button1.innerHTML = "ORDER NOW!"

        var button2 = document.createElement("button")
        button2.setAttribute("id", "order-summary-button")
        button2.setAttribute("class", "btn btn-danger ml-3")
        button2.innerHTML = "ORDER SUMMARY"
        
        buttonDiv.appendChild(button1)
        buttonDiv.appendChild(button2)
    }
})