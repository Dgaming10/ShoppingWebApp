$(".logout").click(function () {
  if (confirm("Are you sure you want to logout?")) {
    $.ajax({
      url: "/users/logout",
      type: "POST",
      success: function (data) {
        //console.log('reloading',data);
        location.reload();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log("error while logging out");
      },
    });
  }
});
