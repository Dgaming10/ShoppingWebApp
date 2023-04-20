const socket = io();

var realProductsHash = "",
  validationProductsHash = "";
socket.on("removeProdutFinal", (msg) => {
  console.log("THE ADMIN DELETED", msg);
  removeProduct(msg["title"]);
  console.log("title: ", msg["title"], msg.title);
  let arr = JSON.parse(localStorage.getItem("cart"));
  if (localStorage.getItem("cart") && arr.includes(msg["title"])) {
    alert("attention! the admin has removed" + msg["title"]);
    const products = JSON.parse(localStorage.getItem("cart"));

    products.splice(products.indexOf(msg["title"]), 1);
    localStorage.setItem("cart", JSON.stringify(products));
    let cartSTR = "";
    products.forEach((item) => (cartSTR += item));
    cartSTR = cartSTR.split("").reverse().join("");
    hashString(cartSTR).then((h) => {
      localStorage.setItem("cartValidator", h);
    });
  }
});

socket.on("addProductFinal", (msg) => {
  addProduct(msg["title"], msg["description"], msg["price"]);
  console.log("THE ADMIN ADDED", msg["title"]);

  if (
    msg["price"] > filters.maxPrice ||
    (filters.colors.length > 0 && !filters.colors.includes(msg["color"])) ||
    (filters.sizes.length > 0 &&
      !msg["sizes"].some((x) => filters.sizes.includes(x)))
  ) {
    console.log("hiding");
    $('.product:has(h3:contains("' + msg["title"] + '"))').hide();
  }

  SortIfNeeded($(".sortItem").find("a.active").text());
});

function addProduct(title, description, price) {
  let varNewProduct = $(".product").first().clone();
  varNewProduct.find("h3").text(title);
  varNewProduct.find("p").text(description);
  console.log("price to be added: " + price);
  let multiplier = 1;
  fetch(
    "https://api.apilayer.com/exchangerates_data/convert?to=" +
      $("#currency-select").val() +
      "&from=USD&amount=1",
    requestOptions
  )
    .then((response) => response.json())
    .then((result) => {
      multiplier = result.result;
      varNewProduct.find("span").eq(0).text($("#currency-select").val());
      if (multiplier != 1) {
        varNewProduct
          .find("span")
          .eq(1)
          .text((price * multiplier).toFixed(4));
      } else {
        varNewProduct.find("span").eq(1).text(price);
      }
    })
    .catch((error) => console.log("error", error));

  varNewProduct.css("display", "block");
  $(".products-grid").append(varNewProduct);
}
socket.on("editProductFinal", (msg) => {
  let product = getProductByTitle(msg["oldTitle"]);
  let title = product.find("h3").text();
  let description = product.find("p").text();
  let price = product.find("span").eq(1).text();
  if (msg["title"] != "") {
    title = msg["title"];
  }
  if (msg["description"] != "") {
    description = msg["description"];
  }
  if (msg["price"] != "") {
    price = msg["price"];
  }

  editProduct(product, title, description, price);
  SortIfNeeded($(".sortItem").find("a.active").text());
  console.log("THE ADMIN EDITED", msg["oldTitle"]);
  let arr = JSON.parse(localStorage.getItem("cart"));
  if (localStorage.getItem("cart") && arr.includes(msg["oldTitle"])) {
    alert("attention! the admin has changed " + msg["oldTitle"]);
    if (msg["oldTitle"] === title) {
      return;
    }

    const products = JSON.parse(localStorage.getItem("cart"));

    products[products.indexOf(msg["oldTitle"])] = title;
    localStorage.setItem("cart", JSON.stringify(products));
    let cartSTR = "";
    products.forEach((item) => (cartSTR += item));
    cartSTR = cartSTR.split("").reverse().join("");
    hashString(cartSTR).then((h) => {
      localStorage.setItem("cartValidator", h);
    });
  }
});

$(document).on("click", ".add-to-cart-btn", function (e) {
  e.preventDefault();

  let isNameExisting = true;
  var txt = $(this).parent(".product").find("h3").text();
  $.ajax({
    url: "/products/" + txt,
    type: "GET",
    async: false,
    error: function (status) {
      console.log("status: " + status.status);
      isNameExisting = false;
    },
  });
  console.log("ISVALID: " + isNameExisting);
  if (!isNameExisting) {
    return;
  }
  if(!confirm(`Are you sure you want to add ${txt} to your cart?`))
  {
    return;
  }
  //console.log(txt);
  var finalS =
    "<li class='bag-item list-group-item'>\
    <span style='float: left;' class='bag-item-title'>" +
    txt +
    "</span><span style='float: right;' class='bag-item-price'><b>" +
    $("#currency-select").val() +
    " " +
    $(this).parent(".product").find(".price-value").text() +
    "</b></span></li>";

  if ($(".bag-list:contains('" + txt + "')").length == 0) {
    $(".cart-content").find("ul").prepend(finalS);
    if ($(".checkout-btn").attr("disabled")) {
      $(".checkout-btn").attr("disabled", false);
    }
  } else {
    alert("This product is already in the bag!");
    return;
  }
  updateTotalCost();
  if (!localStorage.getItem("cart") || !localStorage.getItem("cartValidator")) {
    let cart = [];
    cart.push(txt);
    localStorage.setItem("cart", JSON.stringify(cart));
    const reverse = txt.split("").reverse().join("");
    hashString(reverse).then((h) => {
      localStorage.setItem("cartValidator", h);
    });
    return;
  }

  validateCart(
    JSON.parse(localStorage.getItem("cart")),
    localStorage.getItem("cartValidator")
  ).then((r) => {
    let isFailed = r;
    console.log("isFailed:", isFailed);
    if (!isFailed) {
      alert("validation failed!");
      localStorage.clear();
      $(".bag-item").remove();
      updateTotalCost();
      $(".checkout-btn").attr("disabled", true);
      return;
    }
    let cartP = JSON.parse(localStorage.getItem("cart"));
    cartP.push(txt);
    let cartSTR = "";
    cartP.forEach((item) => (cartSTR += item));
    cartSTR = cartSTR.split("").reverse().join("");
    localStorage.setItem("cart", JSON.stringify(cartP));
    hashString(cartSTR).then((h) => {
      localStorage.setItem("cartValidator", h);
    });
  });
});

function validateCart(cart, validator) {
  if (!localStorage.getItem("cart") || !localStorage.getItem("cartValidator")) {
    return false;
  }
  let cartSTR = "";
  cart.forEach((item) => (cartSTR += item));
  cartSTR = cartSTR.split("").reverse().join("");
  //console.log('validator: ' + validator,typeof validator);
  return hashString(cartSTR).then((h) => {
    //console.log("h:",h,typeof h,h == validator, validator === h);
    return h === validator;
  });
}

async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hash = await crypto.subtle.digest("SHA-256", data);

  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

$(".bag-list").on("click", ".bag-item", async function (e) {
  const isValidated = await validateCart(
    JSON.parse(localStorage.getItem("cart")),
    localStorage.getItem("cartValidator")
  );
  if (!isValidated) {
    localStorage.clear();
    $(".bag-item").remove();
    return;
  }
  const products = JSON.parse(localStorage.getItem("cart"));
  products.splice(products.indexOf($(this).find(".bag-item-title").text()), 1);
  console.log(products, products.length);
  $(this).remove();
  updateTotalCost();
  if (products.length === 0) {
    localStorage.clear();
    return;
  }
  localStorage.setItem("cart", JSON.stringify(products));
  let cartSTR = "";
  products.forEach((item) => (cartSTR += item));
  cartSTR = cartSTR.split("").reverse().join("");
  hashString(cartSTR).then((h) => {
    localStorage.setItem("cartValidator", h);
  });
  e.preventDefault();
});

function updateTotalCost() {
  var finalAmount = 0.0;
  Array.from($(".cart-content").find(".bag-item")).forEach((item) => {
    const sploitted = $(item).find("span");
    finalAmount += parseFloat($(sploitted[1]).text().split(" ")[1]);
  });
  finalAmount = finalAmount.toFixed(3);
  $(".total-bag-value").html(
    '<li class="list-group-item total-bag-value" style="font-size: 1.05rem;">' +
      finalAmount + ' ' + $("#currency-select").val() +
      "</li>"
  );
  console.log(
    "new amount: " + finalAmount,
    typeof finalAmount,
    finalAmount === 0.0,
    finalAmount === 0
  );
  if ($(".bag-item").length === 0) {
    $(".checkout-btn").attr("disabled", true);
  }
}

function removeProduct(title) {
  getProductByTitle(title).remove();
  if ($(".bag-list .bag-item:contains(" + title + ")").length == 0) {
    return;
  }
  $(".bag-list .bag-item:contains(" + title + ")").remove();
  updateTotalCost();
}
function deleteProduct(deletedTitle) {
  console.log(
    "the option: " + $(`.form-select option[value="${deletedTitle}"]`)
  );
  if (
    confirm(
      "Click OK if you sure you want to delete " +
        deletedTitle +
        ", Cancel otherwise"
    )
  ) {
    socket.emit("removeProduct", { title: deletedTitle });
    try {
      $.ajax({
        url: "/products/" + deletedTitle,
        type: "DELETE",
        async: false,
        success: function (res) {
          console.log("SUCCESS!!!! DELETED ");
        },
      });
    } catch (err) {
      console.log("ERROR!!!! " + err);
    }
  }
}

function getProductByTitle(title) {
  return $(".product:has(h3:contains(" + title + "))").filter(function () {
    return $(this).find("h3").text().trim() === title;
  });
}

function editProduct(product, newTitle, newDescription, newPrice) {
  var title = product.find("h3").text();
  var price = newPrice;
  var originalTitle = title;
  let multiplier = 1;
  product.find("h3").text(newTitle);
  product.find("p").text(newDescription);
  fetch(
    "https://api.apilayer.com/exchangerates_data/convert?to=" +
      $("#currency-select").val() +
      "&from=USD&amount=1",
    requestOptions
  )
    .then((response) => response.json())
    .then((result) => {
      multiplier = result.result;
      product.find("span").eq(0).text($("#currency-select").val());
      product
        .find("span")
        .eq(1)
        .text(
          parseInt(multiplier) === 1 ? price : (price * multiplier).toFixed(4)
        );
    })
    .catch((error) => console.log("error", error));
  //add the const to USD every time the user changes currency.
  $(".bag-item").each(function () {
    let title = $(this).find(".bag-item-title").text();
    if (title === originalTitle) {
      $(this)
        .find(".bag-item-price")
        .text(
          $("#currency-select").val() +
            " " +
            (parseInt(multiplier) === 1
              ? price
              : (price * multiplier).toFixed(4))
        );
      $(this).find(".bag-item-title").text(newTitle);
      $(this).find(".bag-item-price").css("font-weight", "bold");
    }
  });

  updateTotalCost();
}
$("#manager-menu-form").submit(function (e) {
  e.preventDefault();

  var inputs = $("#manager-menu-form").find("input");
  var valuesDict = [];
  console.log("inputs: " + valuesDict);
  $("#staticBackdrop1").modal("toggle");

  var checkedValue = $("input[name=flexRadioDefault]:checked")
    .closest("div")
    .find("label")
    .text()
    .replace(/\s/g, "");
  if (checkedValue == "Edit") {
    valuesDict.push($("#new-name-field-manager").val());
    valuesDict.push($("#product-title-select").val());
    valuesDict.push($("#description-field-manager").val());
    valuesDict.push($("#price-field-manager").val());
    console.log("old title mate: " + valuesDict);
    if ($(".product").length == 1) {
      console.log("no products left");
      return;
    }
    var product = getProductByTitle(valuesDict[1]);
    if (product.length == 0) {
      console.log("no such product");
      return;
    }
    if (getProductByTitle(valuesDict[0]).length != 0) {
      console.log("there is already product with the new name");
      return;
    }
    //console.log(valuesDict[3])
    let msg = {
      oldTitle: valuesDict[1],
      title: valuesDict[0],
      description: valuesDict[2],
      price: valuesDict[3],
    };
    socket.emit("editProduct", msg);
    let title = product.find("h3").text();
    let description = product.find("p").text();
    let price = product.find("span").eq(1).text();
    //console.log('price: ' + price + ", " + product.find("p").eq(1).text());
    let category = $("#product-category-select").val();
    let color = $("#product-color-select").val().toLowerCase();
    let size = $("input[name=sizes-manager]:checked")
      .map(function () {
        return $(this).parent("li").text().trim().toLowerCase();
      })
      .get();
    if (size.length == 0) {
      $.get("/products/" + valuesDict[1], function (res) {
        console.log("RESPONSE: ", res[0]["title"]);
        size = res[0]["size"];
      });
    }
    let img = "editImg";
    if (msg["title"] != "") {
      title = msg["title"];
    }

    if (msg["description"] != "") {
      description = msg["description"];
    }
    if (msg["price"] != "") {
      price = msg["price"];
    }
    console.log(
      "values to insert:",
      title,
      description,
      category,
      color,
      size,
      price,
      img
    );
    $.ajax({
      url: "/products/" + valuesDict[1],
      type: "PUT",
      async: false,
      data: {
        newTitle: title,
        description: description,
        category: category,
        color: color,
        size: size,
        price: price,
        img: img,
      },
      success: function (res) {
        console.log("valDict1: ", valuesDict[1]);
        console.log(
          "SUCCESS!!!! EDITED " +
            $("#manager-menu-form")
              .find(`option[value="${valuesDict[1]}"]`)
              .text(),
          valuesDict[1],
          title
        );
        $("#manager-menu-form")
          .find(`option[value="${valuesDict[1]}"]`)
          .text(title);
        $("#manager-menu-form")
          .find(`option[value="${valuesDict[1]}"]`)
          .val(title);
      },
    });
  } else if (checkedValue == "Add") {
    valuesDict.push($("#name-field-manager").val());
    valuesDict.push($("#description-field-manager").val());
    valuesDict.push($("#price-field-manager").val());
    if (
      $(".product").filter(function () {
        return $(this).find("h3").text() === valuesDict[0];
      }).length != 0 &&
      valuesDict[0] != "Product null"
    ) {
      console.log("There is already a product with the same name!");
      return;
    }
    socket.emit("addProduct", {
      title: valuesDict[0],
      description: valuesDict[1],
      price: valuesDict[2],
      color: $("#product-color-select").val().toLowerCase(),
      category: $("#product-category-select").val(),
      sizes: $("input[name=sizes-manager]:checked")
        .map(function () {
          return $(this).parent("li").text().trim().toLowerCase();
        })
        .get(),
    });
    $.ajax({
      url: "/products/",
      type: "POST",
      async: false,
      data: {
        title: valuesDict[0],
        description: valuesDict[1],
        category: $("#product-category-select").val(),
        color: $("#product-color-select").val().toLowerCase(),
        size: $("input[name=sizes-manager]:checked")
          .map(function () {
            return $(this).parent("li").text().trim().toLowerCase();
          })
          .get(),
        price: valuesDict[2],
        img: "IMG",
      },
      success: function (res) {
        console.log("SUCCESS!!!! ADDED " + JSON.stringify(res));
      },
    });
    let newOption = $("<option></option>")
      .val(valuesDict[0])
      .text(valuesDict[0]);
    $("#product-title-select").append(newOption);
    $.ajax({
            url: "/twitter/addProduct",
            type: "POST",
            async: false,
            data: {title : valuesDict[0], price: valuesDict[2]},
            success: function(res){
                console.log("posted a new tweet with the new product");
            }
        });
  } else {
    let title = $("#product-title-select").val();
    deleteProduct(title);
  }
});
let filters = { colors: [], sizes: [], maxPrice: 100, category: [] };
$("#staticBackdrop1").on("show.bs.modal", function (e) {
  // if($(".product").length == 1) : ADD IF ONLY ONE PRODUCT IS LEFT
  // {

  // }
  // else
  // {

  // }
  $.get("/products/" + $("#product-title-select").val(), function (res) {
    console.log("RESPONSE: ", res[0]);
    const [
      titleVar,
      descriptionVar,
      categoryVar,
      colorVar,
      sizeVar,
      priceVar,
      imgVar,
    ] = [
      res[0]["title"],
      res[0]["description"],
      res[0]["category"],
      res[0]["color"],
      res[0]["size"],
      res[0]["price"],
      res[0]["img"],
    ];
    $("#product-category-select").val(categoryVar);

    $("#product-color-select").val(
      colorVar.charAt(0).toUpperCase() + colorVar.substring(1)
    );
    $("#price-field-manager").val(priceVar);
    $("#description-field-manager").val(descriptionVar);
    let sizesCheckBoxes = $("input[name=sizes-manager]");

    sizesCheckBoxes.prop("checked", false);
    sizeVar.forEach((lbl) => {
      let current = sizesCheckBoxes.filter(
        (_, elem) => $(elem).next().text().trim() === lbl.toUpperCase()
      );
      current.prop("checked", true);
    });
    // console.log("M: ",titleVar,descriptionVar, categoryVar, colorVar, sizeVar, priceVar, imgVar);
  });

  $("#product-title-select").change(function () {
    $.get("/products/" + $("#product-title-select").val(), function (res) {
      console.log("RESPONSE: ", res[0]);
      const [
        titleVar,
        descriptionVar,
        categoryVar,
        colorVar,
        sizeVar,
        priceVar,
        imgVar,
      ] = [
        res[0]["title"],
        res[0]["description"],
        res[0]["category"],
        res[0]["color"],
        res[0]["size"],
        res[0]["price"],
        res[0]["img"],
      ];
      $("#product-category-select").val(categoryVar);
      let m = "sad";
      $("#product-color-select").val(
        colorVar.charAt(0).toUpperCase() + colorVar.substring(1)
      );
      $("#price-field-manager").val(priceVar);
      $("#description-field-manager").val(descriptionVar);
      let sizesCheckBoxes = $("input[name=sizes-manager]");
      console.log("hey: " + sizeVar);
      sizesCheckBoxes.prop("checked", false);
      sizeVar.forEach((lbl) => {
        let current = sizesCheckBoxes.filter(
          (_, elem) => $(elem).next().text().trim() === lbl.toUpperCase()
        );
        current.prop("checked", true);
      });
      // console.log("M: ",titleVar,descriptionVar, categoryVar, colorVar, sizeVar, priceVar, imgVar);
    });
    console.log("CHANGED!");
  });
  $(this)
    .find(".form-check")
    .find("input.edit-add-delete")
    .click(function (f) {
      let name = $(this).parent("div").find("label").text().replace(/\s/g, "");
      $("#manager-menu-form :input").prop("disabled", false);
      console.log("name", name);
      if (name === "Edit") {
        $(".edit-mode-aside").parent("div").show();
        $(".edit-mode-aside").closest("aside").show();
        $("#price-field-manager").prop("required", false);
        $("#description-field-manager").prop("required", false);
        $("#name-field-manager").parent("div").hide();
        $("#product-title-select").parent("div").show();
        $("#name-field-manager").prop("required", false);
      } else {
        $(".edit-mode-aside").parent("div").hide();
        $(".edit-mode-aside").closest("aside").hide();
        $("#price-field-manager").prop("required", true);
        $("#description-field-manager").prop("required", true);
        $("#name-field-manager").parent("div").show();
        $("#product-title-select").parent("div").hide();
        $("#name-field-manager").prop("required", true);
      }
      if (name === "Delete") {
        console.log($(".checkoutForm").find("input"));
        $("#manager-menu-form :input").prop("disabled", true);
        $(".edit-add-delete").prop("disabled", false);
        $("#manager-menu-form-submit-btn").prop("disabled", false);
        $("#product-title-select").parent("div").show();
        $("#product-title-select").prop("disabled", false);
        $("#name-field-manager").parent("div").hide();
      }
    });
  $(this)
    .find(".form-check")
    .find("input.edit-add-delete")
    .unbind()
    .click(function (f) {
      let name = $(this).parent("div").find("label").text().replace(/\s/g, "");
      $("#manager-menu-form :input").prop("disabled", false);
      console.log("name", name);
      if (name === "Edit") {
        $(".edit-mode-aside").parent("div").show();
        $(".edit-mode-aside").closest("aside").show();
        $("#price-field-manager").prop("required", false);
        $("#description-field-manager").prop("required", false);
        $("#name-field-manager").parent("div").hide();
        $("#product-title-select").parent("div").show();
        $("#name-field-manager").prop("required", false);
      } else {
        $(".edit-mode-aside").parent("div").hide();
        $(".edit-mode-aside").closest("aside").hide();
        $("#price-field-manager").prop("required", true);
        $("#description-field-manager").prop("required", true);
        $("#name-field-manager").parent("div").show();
        $("#product-title-select").parent("div").hide();
        $("#name-field-manager").prop("required", true);
      }
      if (name === "Delete") {
        console.log($(".checkoutForm").find("input"));
        $("#manager-menu-form :input").prop("disabled", true);
        $(".edit-add-delete").prop("disabled", false);
        $("#manager-menu-form-submit-btn").prop("disabled", false);
        $("#product-title-select").parent("div").show();
        $("#product-title-select").prop("disabled", false);
        $("#name-field-manager").parent("div").hide();
      }
    });
});

function filterProducts(maxPrice, colors, sizes, category) {
  console.log("FILTER WITH:" + category, maxPrice);
  $.ajax({
    url: "/products/productFilter",
    type: "GET",
    async: false,
    data: {
      maxPrice: maxPrice,
      colors: colors,
      sizes: sizes,
      category: category,
    },
    success: function (res) {
      $(".product").css("display", "none");
      let filteredElements = [];
      res.forEach(function (pr) {
        filteredElements.push(pr.title);
      });
      $(".product").each(function () {
        let txt = $(this).find("h3").text();
        if (filteredElements.includes(txt)) {
          $(this).show();
        }
      });
    },
  });
}

$(".filter-btn").click(function () {
  //console.log("clicked!");
  var selectedColors = $("input[name=color]:checked")
    .map(function () {
      return $(this).parent("li").text().trim().toLowerCase();
    })
    .get();

  var selectedSizes = $("input[name=size]:checked")
    .map(function () {
      return $(this).parent("li").text().trim().toLowerCase();
    })
    .get();
  //{maxPrice: $("#price").val(), colors: selectedColors, sizes: selectedSizes, category: filters.category}
  filters = {
    maxPrice: $("#price").val(),
    colors: selectedColors,
    sizes: selectedSizes,
    category: filters.category,
  };
  filterProducts(
    $("#price").val(),
    selectedColors,
    selectedSizes,
    filters.category
  );
  setTimeout(SortIfNeeded($(".sortItem").find("a.active").text()), 200);
});

$(".type-selector").click(function () {
  if ($(this).find(".image-layer").css("opacity") === "0.4") {
    $(this).find(".image-layer").animate({ opacity: 0 }, 100);
    //{maxPrice: filters.maxPrice, colors: filters.colors, sizes: filters.sizes}
    console.log("calling filter products1");
    filterProducts(filters.maxPrice, filters.colors, filters.sizes, []);
    filters.category = [];
  }
  if (
    $(".image-layer").filter(function () {
      return $(this).css("opacity") === "0.4";
    }).length == 0
  ) {
    //{maxPrice: filters.maxPrice, colors: filters.colors, sizes: filters.sizes, category : $(this).attr('id')}
    $(this).find(".image-layer").animate({ opacity: 0.4 }, 100);
    console.log("calling filter products2");
    filterProducts(
      filters.maxPrice,
      filters.colors,
      filters.sizes,
      $(this).attr("id")
    );
    filters.category = [$(this).attr("id")];
  }
  console.log("calling SortIfNeeded");
  SortIfNeeded($(".sortItem").find("a.active").text());

  //console.log("CLICKED1! " + $(this).find('.image-layer').css('opacity'));
});
function sortProductsAndShow(products, sortFunction) {
  let sortedProducts = products.sort(sortFunction);
  $(".product").hide();
  for (let i = 0; i < sortedProducts.length; i++) {
    $(sortedProducts[i]).show().css("order", i);
  }
}
//CHECK PROBLEM WITH SORTING
function SortIfNeeded(txt) {
  console.log("VISIBLE: " + $(".product:visible"));
  let productsArray = $(".product:visible");
  let sortingFunc = {};
  if (txt === "Price Low to High") {
    sortingFunc = function (p1, p2) {
      let priceA = parseInt($(p1).find(".price-value").text());
      let priceB = parseInt($(p2).find(".price-value").text());
      return priceA - priceB;
    };
    console.log("GOING HERE");
  } else if (txt === "Price High to Low") {
    sortingFunc = function (p1, p2) {
      let priceA = parseInt($(p1).find(".price-value").text());
      let priceB = parseInt($(p2).find(".price-value").text());
      return priceB - priceA;
    };
  } else {
    console.log("going here 2");
    let visible = $(".product:visible");

    visible.hide();
    visible.show().css("order", 0);
    return;
  }
  console.log("sorting func: " + sortingFunc);
  sortProductsAndShow(productsArray, sortingFunc);
}
$(".sortItem").click(function () {
  let m = "Hello";
  console.log($('.product:has(h3:contains("' + m + '"))'));
  if ($(this).find("a").hasClass("active")) {
    console.log("ALREADY SORTED");
    return;
  }
  //if button is already pressed, return
  SortIfNeeded($(this).find("a").text());
  console.log("ALREADY TURNED ON: " + $(".sortItem").find("a.active").text());
  $(".sortItem").find("a.active").removeClass("active");
  $(this).find("a").addClass("active");
});

$(".checkoutForm").submit(async function (e) {
  e.preventDefault();
  const isValidated = await validateCart(
    JSON.parse(localStorage.getItem("cart")),
    localStorage.getItem("cartValidator")
  );
  if (!isValidated) {
    $("#staticBackdrop").modal("hide");
    localStorage.clear();
    $(".bag-item").remove();
    return;
  }
  const productsArr = JSON.parse(localStorage.getItem("cart"));
  let finalPrice = 0;

  let userID = "";
  $.ajax({
    url: "/users/",
    type: "GET",
    async: false,
    success: function (res) {
      console.log("res: " + res.userId);
      userID = res.userId;
    },
  });
  if (userID.length === 0) {
    return;
  }

  let idArr = [];
  productsArr.forEach(function (product) {
    $.ajax({
      url: "/products/" + product,
      type: "GET",
      async: false,
      success: function (res) {
        console.log(res[0], Object.keys(res));
        idArr.push(res[0]._id);
        finalPrice += res[0].price;
      },
    });
  });
  console.log("all IDS: " + idArr);
  if (userID.length !== 0) {
    $.ajax({
      url: "/orders/",
      type: "POST",
      async: false,
      data: {
        userID: userID,
        products: idArr,
        price: finalPrice,
        currency: $("#currency-select").val(),
      },
      success: function (res) {
        alert(
          "Thank you for your purchase! of " +
            finalPrice * FROM_USD_TO_CURRENT +
            " " +
            $("#currency-select").val()
        );
        $(".bag-item").remove();
        localStorage.clear();
        location.reload();
      },
    });
  }
});
var current = "USD";
var originalPrices = [];
var FROM_USD_TO_CURRENT = 1;
var myHeaders = new Headers();
myHeaders.append("apikey", "Y0L7VXCGvn7U1lvbe7kP80lc27rwVJ19");
var requestOptions = {
  method: "GET",
  redirect: "follow",
  headers: myHeaders,
};

$(document).ready(async function () {
  await fetch(
    "https://api.apilayer.com/exchangerates_data/symbols",
    requestOptions
  )
    .then((response) => response.json())
    .then((result) => {
      var selectElement = $("#currency-select");
      $.each(result.symbols, function (symbol, name) {
        var optionElement = $("<option>")
          .val(symbol)
          .text(name + " (" + symbol + ")");
        selectElement.append(optionElement);
      });
    })
    .catch((error) => console.log("error", error));
  $("#currency-select option[value='USD']").prop("selected", true);

  if (!localStorage.getItem("cart") || !localStorage.getItem("cartValidator")) {
    localStorage.clear();
    return;
  }
  const isValidated = await validateCart(
    JSON.parse(localStorage.getItem("cart")),
    localStorage.getItem("cartValidator")
  );
  console.log("is: " + isValidated);
  if (!isValidated) {
    localStorage.clear();
    return;
  }

  const productsInCart = JSON.parse(localStorage.getItem("cart"));
  productsInCart.forEach(function (p) {
    var txt = p;

    var finalS =
      "<li class='bag-item list-group-item'>\
        <span style='float: left;' class='bag-item-title'>" +
      txt +
      "</span><span style='float: right;' class='bag-item-price'><b>" +
      $("#currency-select").val() +
      " " +
      $(`.product:has(h3:contains(${txt}))`).find(".price-value").text() +
      "</b></span></li>";

    $(".cart-content").find("ul").prepend(finalS);

    if ($(".checkout-btn").attr("disabled")) {
      $(".checkout-btn").attr("disabled", false);
    }
  });

  updateTotalCost();
});

$("#currency-select").change(function () {
  //console.log('from: ' + $(this).val() + " to: " + current);

  let multiplier = 1;
  let currency = $(this).val(); // assign $(this) to a variable
  fetch(
    "https://api.apilayer.com/exchangerates_data/convert?to=" +
      currency +
      "&from=" +
      current +
      "&amount=1",
    requestOptions
  )
    .then((response) => response.json())
    .then((result) => {
      multiplier = result.result;
      //console.log('multiplier: ', multiplier);

      $(".price-symbol").text(currency); // use the variable instead of $(this)

      $(".price-value").each(function () {
        $(this).text((parseFloat($(this).text()) * multiplier).toFixed(4));
      });

      $(".bag-item").each(function () {
        let oldPrice = $(this).find(".bag-item-price").text();
        let newPrice = parseFloat(oldPrice.split(" ")[1]) * multiplier;
        let formattedPrice =
          $("#currency-select").val() + " " + newPrice.toFixed(4);
        //console.log('formatted: ',formattedPrice);
        $(this).find(".bag-item-price").text(formattedPrice);
        $(this).find(".bag-item-price").css("font-weight", "bold");
      });

      $(".total-bag-value").text(
        (parseFloat($(".total-bag-value").text()) * multiplier).toFixed(4) +
          " " +
          currency
      ); // use the variable instead of $(this)
      current = currency;
      if (current === "USD") {
        FROM_USD_TO_CURRENT = multiplier;
      } else {
        FROM_USD_TO_CURRENT *= multiplier;
      }
    })
    .catch((error) => console.log("error", error));
  //   fetch("https://api.apilayer.com/exchangerates_data/convert?to=" +  + "&from=" + current +  "&amount=1", requestOptions)
  //   .then(response => response.json())
  //   .then(result => {

  //   });
});

$(".checkout-btn").click(async function () {
  const isValidated = await validateCart(
    JSON.parse(localStorage.getItem("cart")),
    localStorage.getItem("cartValidator")
  );
  if (!isValidated) {
    $("#staticBackdrop").modal("hide");
    localStorage.clear();
    return;
  }
});
