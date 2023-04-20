$("form").submit(function (e) {
  e.preventDefault();

  $.ajax({
    type: "POST",
    url: "/users/login",
    data: { username: $(".username").val(), password: $(".password").val() },
    success: function (res) {
      console.log("RES " + res + ", " + typeof res);
      if (typeof res !== "string") {
        window.location.href = "/home-page";
      } else {
        $(".errorMSG").text(res);
      }
    },
  });
});
