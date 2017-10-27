$(document).ready(function() {
    $("body").on("click", "div.card.diamonds.rank1", (event) => {
        // console.log(event.curr)
        $(this).find('div.card.diamonds.rank1').css("transform", "translate(0px, 230px)")
});

});



// $( "#book" ).hide( "slow", function() {
//     alert( "Animation complete." );
