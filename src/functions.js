// Mainly functions to display elements / change DOM
// Does not render functionality of components

// Load elements of register page
export function show_register() {
    let texts = document.getElementsByClassName("text_input");
    while(texts[0]) {
        texts[0].parentNode.removeChild(texts[0]);
    }

    document.getElementById("register_text").remove();

    const form = document.getElementById("form_content");

    form.appendChild(create_textField("Username"));
    form.appendChild(create_textField("Password", "Password", true));
    form.appendChild(create_textField("ConfirmPassword", "Confirm Password", true));
    form.appendChild(create_textField("Email"));
    form.appendChild(create_textField("Name"));

    let reg_container = document.createElement("div");
    reg_container.id = "regButtons";

    let submit = document.getElementById("submit");
    let back = document.createElement("button");
    back.id = "backButton";
    back.textContent = "🡄";

    submit.textContent = "Register";
    submit.id = "registerButton";

    reg_container.appendChild(back);
    reg_container.appendChild(submit);
    form.appendChild(reg_container);
    back.onclick = function () {show_login();};
}

// Create a text field element
function create_textField(name, Placeholder, isPassword, className, id) {
    let text = document.createElement("input");
    text.setAttribute("type", "text");

    if (isPassword) {
        text.setAttribute("type", "password");
    }

    if (className) {
        text.classList.add(className);
    }

    if (id) {
        text.id = id;
    }

    text.setAttribute("id", name);
    text.setAttribute("name", name);

    if (Placeholder) {
        text.setAttribute("placeholder", Placeholder);
    } else {
        text.setAttribute("placeholder", name);
    }

    text.classList.add("text_input");

    return text;
}

// Show dialog in modal as a pop up
export function show_dialog(message, isError) {

    // If modal already has a message
    let Oldtext = document.getElementById("modal_text");
    if (Oldtext) {
        Oldtext.remove();
    }

    // Get the modal
    let modal = document.getElementById("myModal");
    let content = document.getElementById("modal_content");

    let modal_text = create_div_id("modal_text", message);

    if (isError) {
        modal_text.style.color = "#cc1b1b";
        modal_text.style.fontWeight = "bold";
    }

    content.appendChild(modal_text);

    modal.style.display = "block";

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
        while (content.lastChild.id !== "modal_close") {
            content.removeChild(content.lastChild);
        }
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            while (content.lastChild.id !== "modal_close") {
                content.removeChild(content.lastChild);
            }
        }
    }
}

// Show elements of login page
export function show_login() {
    let content = document.getElementById("form_content");
    let but = document.getElementById("registerButton");

    document.getElementById("Username").style.borderColor = "black";
    document.getElementById("Password").style.borderColor = "black";

    but.textContent = "Log in";
    but.id = "submit";
    content.appendChild(but);

    document.getElementById("ConfirmPassword").remove();
    document.getElementById("Email").remove();
    document.getElementById("Name").remove();
    document.getElementById("regButtons").remove();

    let text = document.createElement("span");
    text.id = "register_text";
    text.textContent = "Don't have an account?";

    let reg = document.createElement("a");
    reg.href = "#";
    reg.id = "register_button";
    reg.textContent = " Register now";
    reg.onclick = function () {show_register();};

    text.appendChild(reg);
    content.appendChild(text);


}

// Show elements of main page (Banner, feed container, right tab)
export function show_main() {

    console.log("loading main page");

    let container = document.getElementsByClassName("container")[0];

    let form = document.getElementById("form");

    if (form) {
        form.remove();
    }

    container.style.display = "flex";

    let banner = create_div_id("banner");

    let title = create_div_id("banner_title", "Quickpic");

    let homeIcon = document.createElement("img");
    homeIcon.alt = "home icon";
    homeIcon.id = "homeIcon";
    homeIcon.src = "/images/homeicon.png";
 
    let profileIcon = document.createElement("img");
    profileIcon.alt = "profile icon";
    profileIcon.id = "profileIcon";
    profileIcon.src = "images/profileicon.png";

    let exitIcon = document.createElement("img");
    exitIcon.alt = "exit icon";
    exitIcon.id = "exitIcon";
    exitIcon.src = "images/exiticon.png";

    let icons = create_div_id("banner_icons");

    banner.appendChild(title);

    icons.appendChild(homeIcon);
    icons.appendChild(profileIcon);
    icons.appendChild(exitIcon);
    banner.appendChild(icons);  
    container.appendChild(banner);

    let main = create_div_id("main");
    let feed = create_div_id("feed");
    let rightTab = create_div_id("rightTab");
    let postButton = create_div_id("createPostButton", "▲ POST");
    let rightProfile = create_div_id("rightProfile");

    main.appendChild(feed);

    rightTab.appendChild(rightProfile);
    rightTab.appendChild(postButton);
    main.appendChild(rightTab);

    container.appendChild(main);
}

// Create a div element with a specific id/text
export function create_div_id(id, text){
    let r = document.createElement("div");
    r.id = id;
    r.textContent = text;
    return r;
}

// Create a post container to show on feed 
export function create_post_container(post, user_id, canEdit){
    let id = post["id"];
    let meta = post["meta"];
    let src = post["src"];
    let comments = post["comments"];

    let container = create_div_class("postContainer");
    container.id = "postcontainer" + id;

    container.appendChild(create_post_header(meta, id, canEdit));
    container.appendChild(create_image_container(src,meta["description_text"]));
    container.appendChild(create_postBar(meta["likes"],id, user_id));
    container.appendChild(create_postComments(comments, id));
    container.appendChild(create_makeComment(id));

    return container;

}

// Create header for a post container
function create_post_header(meta, id, canEdit) {

    let header = create_div_class("postHeader");

    let author = meta["author"];
    let description = meta["description_text"];
    let time = meta["published"];

    // Convert Epoch time to time since
    // E.g "4 minutes ago" , "A few seconds ago"
    time = new Date(0).setUTCSeconds(time);
    time = moment(time).fromNow();

    let postInfo = create_div_class("postInfo");
    postInfo.id = "header" + id;

    // Add profile picture to the header
    let profilePic = create_img("/images/profilepic.png", "profile picture");
    profilePic.classList.add("postProfile");
    postInfo.appendChild(profilePic);

    // Add name and time to header under tags div
    let infoTags = create_div_class("postInfoTags");
    
    infoTags.appendChild(create_div_class("postInfoName", author));
    infoTags.appendChild(create_div_class("postInfoTime", time));

    postInfo.appendChild(infoTags);

    // If post is made by the user, add an edit icon
    if (canEdit) {
        let edit = create_img("/images/edit.png", "edit icon", "edit" + id);
        edit.classList.add("edit");
        postInfo.appendChild(edit);
    }

    header.appendChild(postInfo)

    let desc = create_div_class("postDescription", description);
    desc.id = "desc" + id;
    header.appendChild(desc);

    return header; 
}

// Create a div with specific class name and/or text
function create_div_class(name, text) {
    let r = document.createElement("div");
    r.classList.add(name);
    r.textContent = text;

    return r;
}

// Create an image with src, alt and id
function create_img(src, alt, id) {
    let pic = document.createElement("img");
    pic.src = src;
    pic.alt = alt;

    if (id) {
        pic.id = id;
    }

    return pic;
}

// Create an image container for the post
function create_image_container(src, description) {
    let container = create_div_class("imageContainer");
    let base = "data:image/png;base64," + src;

    container.appendChild(create_img(base, description + " - post image"));

    return container;
}

// Create the post bar which shows the like button and # likes
function create_postBar(likes, id, user_id) {
    let bar = create_div_class("postBar");
    let s = create_img("/images/heart.svg", "heart icon");
    s.id = "heart" + id;

    for (let like in likes) {
        if (likes[like] === user_id) {
            s.toggleAttribute("liked");
        }
    }

    let span = document.createElement("span");
    span.id = "likes" + id;
    span.textContent = Object.keys(likes).length;

    bar.appendChild(s);
    bar.appendChild(span);

    return bar;
}

// Create the comment section of post
function create_postComments(comments, id) {
    let postComments = create_div_class("postComments");
    postComments.id = "comments" + id;

    // If there are many comments, limit the height and add scroll functionality
    if (Object.keys(comments).length > 4) {
        postComments.style.height = "150px";
    }

    for (let comment in comments) {
        postComments.appendChild(create_commentContainer(comments[comment]));
    }

    return postComments;
}

// Create container for a single comment which has profile picture, time and author
export function create_commentContainer(comment) {

    let container = create_div_class("commentContainer");

    let time = comment["published"];

    // Change time to "A few seconds", "2 minutes" etc..
    time = new Date(0).setUTCSeconds(time);
    time = moment(time).fromNow();
    time = time.replace("ago","");
    time = time.replace("in ","");

    let name_container = create_div_class("commentName");
    name_container.appendChild(create_div_class("comment_name", comment["author"]));
    name_container.appendChild(create_div_class("comment_time", time));

    container.appendChild(name_container);
    container.appendChild(create_div_class("commentText", comment["comment"]));
    return container;
}

// Create the make comment section with a textarea and button to post
function create_makeComment(id) {
    let container = create_div_class("makeComment");

    let form = document.createElement("form");
    form.name = id;

    let text = document.createElement("textarea");
    text.classList.add("commentInput");
    text.id = "text" + id;
    text.placeholder = "Make a comment...";

    let but = create_button("post" + id, "POST", "postComment")

    form.appendChild(text);
    form.appendChild(but);

    container.appendChild(form);
    return container;
}

// Show elements of the profile page 
export function load_profile_page(info) {
    console.log("loading profile page");
    console.log(info);
    document.getElementById("feed").textContent = "";

    // Remove follow buttons from right tab
    remove_followButtons();

    let followers = document.getElementById("follower_count");
    let following = document.getElementById("following_count");
    let rightName = document.getElementById("rightProfileName");
    let rightUser = document.getElementById("rightProfileUser");

    followers.textContent = info["followed_num"]
    following.textContent = Object(info["following"]).length;
    rightName.textContent = info["name"];
    rightUser.textContent = info["username"];

    // If a button already exists (e.g create post)
    // Change it to settings button
    let button = document.getElementById("createPostButton");

    if (button) {
        button.id = "changeSettingsButton";
        button.textContent = "⚙ UPDATE";
    } 

}

// Load user right information given info
export function load_userRight(info) {
    remove_followButtons();

    let followers = document.getElementById("follower_count");
    let following = document.getElementById("following_count");
    let rightName = document.getElementById("rightProfileName");
    let rightUser = document.getElementById("rightProfileUser");

    followers.textContent = info["followed_num"]
    following.textContent = Object(info["following"]).length;
    rightName.textContent = info["name"];
    rightUser.textContent = info["username"];

}

// Show elements of home page
export function show_home() {
    let homeButton = document.getElementById("homeIcon");
    homeButton.toggleAttribute("on");

    let profileButton = document.getElementById("profileIcon");

    // Highlight home page icon to indicate that it is active
    if (profileButton.hasAttribute("on")) {
        profileButton.toggleAttribute("on");
    }

    let postButton= document.getElementById("createPostButton");
    if (postButton && postButton.style.display === "none") {
        postButton.style.display = null;
    }

    let main = document.getElementById("main");
    document.getElementById("feed").textContent = "";
    let rightTab = document.getElementById("rightTab");

    // If a button exists (Change settings button)
    // change it to create post button
    let button = document.getElementById("changeSettingsButton");
    if (button) {
        button.id = "createPostButton";
        button.textContent = "▲ POST";
    }

}

// Show elements of update settings page
// Add email and form
export function show_settings(email) {
    let feed = document.getElementById("feed");
    feed.textContent = "";

    let settings = create_div_id("settings");

    let form = document.createElement("form");
    form.name = "settings";
    form.id = "settings";

    settings.appendChild(create_div_id("email_box", email));
    settings.appendChild(create_text_input("text_input", "newName", "New Name"));
    settings.appendChild(create_text_input("text_input", "newEmail", "New Email"));
    settings.appendChild(create_textField("newPass", "New Password", true));
    settings.appendChild(create_textField("newPassConfirm", "Confirm Password", true));


    let but = create_button("update", "UPDATE")

    settings.appendChild(but);

    form.appendChild(settings);
    feed.appendChild(form);


}

// Create a text input element which can have a class, name and placeholder
function create_text_input(className, name, placeholder) {
    let r = document.createElement("input");
    r.type = "text";
    r.classList.add(className);
    r.name = name;
    r.placeholder = placeholder;

    return r;
}

// Load elements of a specific user page
export function show_userPage(following) {

    // Hide buttons (Create post / Change settings)
    hide_bigButtons();

    // Clear feed
    let feed = document.getElementById("feed");
    feed.textContent = "";

    // Remove active state of home and profile buttons
    let home_icon = document.getElementById("homeIcon");
    let profile_icon = document.getElementById("profileIcon");

    if (home_icon.hasAttribute("on")) {
        home_icon.toggleAttribute("on");
    }

    if (profile_icon.hasAttribute("on")) {
        profile_icon.toggleAttribute("on");
    }

    // Update right banner
    // Show follow icon if user doesn't follow the specific user
    // Show unfollow icon if user already follows
    let rightTab = document.getElementById("followerInfo");
    if (following === true) {
        let follow = document.getElementById("follow");
        if (follow) {
            follow.remove();
        }

        if (!document.getElementById("unfollow")){
            let pic = create_img("/images/follow.png", "unfollow button", "unfollow") 
            rightTab.appendChild(pic);
        }
    } else {
        let unfollow = document.getElementById("unfollow");
        if (unfollow) {
            unfollow.remove();
        }

        if (!document.getElementById("follow")){
        let pic = create_img("/images/unfollow.png", "follow button", "follow") 
        rightTab.appendChild(pic);
        }
    }

}

// Remove follow buttons from the right tab
function remove_followButtons() {
    let follow = document.getElementById("follow");
    if (follow) {
        follow.remove();
    }

    let unfollow = document.getElementById("unfollow");
    if (unfollow) {
        unfollow.remove();
    }
}

// Hide the create post or change settings button
function hide_bigButtons() {
    let button = document.getElementById("createPostButton");

    if (button) {
        button.style.display = "none";
    }

    let button2 = document.getElementById("changeSettingsButton");

    if (button2) {
        button2.style.display = "none";
    }
}

// Live update: change unfollow button to follow and change count 
export function changeToFollow() {
    let follow = document.getElementById("unfollow");
    follow.remove();
    let rightTab = document.getElementById("followerInfo");
    let pic = create_img("/images/unfollow.png", "follow button", "follow") 
    rightTab.appendChild(pic);

    let follower_n = document.getElementById("follower_count");

    let num = parseInt(follower_n.textContent) - 1;
    num = "" + num;
    follower_n.textContent = num;


}

// Live update: change follow button to unfollow and change count 
export function changeToUnfollow() {
    let follow = document.getElementById("follow");
    follow.remove();
    let rightTab = document.getElementById("followerInfo");
    let pic = create_img("/images/follow.png", "unfollow button", "unfollow") 
    rightTab.appendChild(pic);

    let follower_n = document.getElementById("follower_count");

    let num = parseInt(follower_n.textContent) + 1;
    num = "" + num;
    follower_n.textContent = num;
}

// Show the prompt to make a post
export function show_createPostPrompt() {
    // Get the modal
    let modal = document.getElementById("myModal");
    let content = document.getElementById("modal_content");

    let create_post_container = create_div_id("post_container");

    let form = document.createElement("form");
    form.name = "post";
    form.id = "post";

    // Add text area input
    let text = document.createElement("textarea");
    text.classList.add("postInput");
    text.id = "postInput";
    text.name = "postInput"
    text.placeholder = "Post description...";

    // Add image upload
    let upload = document.createElement("input");
    upload.type = "file";
    upload.id = "fileUpload";
    upload.name = "file"

    create_post_container.appendChild(create_div_id("createPostHeading", "CREATE POST"));
    create_post_container.appendChild(text);
    create_post_container.appendChild(upload);


    let but = create_button("confirmPostButton", "POST");

    create_post_container.appendChild(but);

    form.appendChild(create_post_container);
    content.appendChild(form);



    modal.style.display = "block";

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
        while (content.lastChild.id !== "modal_close") {
            content.removeChild(content.lastChild);
        }
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            while (content.lastChild.id !== "modal_close") {
                content.removeChild(content.lastChild);
            }
        }
    }
}

export function show_editPrompt() {
    // Get the modal
    let modal = document.getElementById("myModal");
    let content = document.getElementById("modal_content");

    let create_post_container = create_div_id("post_container");

    let form = document.createElement("form");
    form.name = "edit";
    form.id = "post";

    // Add text input to update description
    let text = document.createElement("textarea");
    text.classList.add("postInput");
    text.id = "postInput";
    text.name = "postInput"
    text.placeholder = "New Description...";

    create_post_container.appendChild(create_div_id("createPostHeading", "UPDATE POST"));
    create_post_container.appendChild(text);


    // Add button to update post
    let but = create_button("editPostButton", "UPDATE")

    // Add button to delete post
    let but2 = create_button("deletePostButton", "DELETE")

    let buttons = create_div_class("edit_buttons");

    buttons.appendChild(but);
    buttons.appendChild(but2);

    create_post_container.appendChild(buttons);

    form.appendChild(create_post_container);
    content.appendChild(form);



    modal.style.display = "block";

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
        while (content.lastChild.id !== "modal_close") {
            content.removeChild(content.lastChild);
        }
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            while (content.lastChild.id !== "modal_close") {
                content.removeChild(content.lastChild);
            }
        }
    }
}

// Show modal to display people the user follows
export function show_following_modal() {
    // Get the modal
    let modal = document.getElementById("myModal");
    let content = document.getElementById("modal_content");

    let following = create_div_id("following_container");
    following.appendChild(create_div_id("following_heading", "Following "))
    content.appendChild(following);

    modal.style.display = "block";

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
        while (content.lastChild.id !== "modal_close") {
            content.removeChild(content.lastChild);
        }
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            while (content.lastChild.id !== "modal_close") {
                content.removeChild(content.lastChild);
            }
        }
    }
}

// Add specific user to the "following" modal
export function add_following(username) {
    let content = document.getElementById("following_container");
    let box = create_div_class("following_info");
    box.id = "info"+username;
    let profile = create_img("/images/profilepic.png", "profile picture");
    profile.classList.add("followingProfile");

    box.appendChild(profile);
    box.appendChild(create_div_class("followingName", username));

    let pic = create_img("/images/follow.png", "unfollow button", "unfollow"+username);
    pic.classList.add("unfollow");
    box.appendChild(pic)

    content.appendChild(box);
}

// If user doesn't follow anyone, the following modal should say "You dont follow anyone!"
export function show_noFollowing() {
    let content = document.getElementById("following_container");
    let box = create_div_id("noFollow", "You dont follow anyone!");
    content.appendChild(box);
}

// Back to login
export function reset_page() {
    let container = document.getElementsByClassName("container")[0];

    while (container.lastChild.id !== "myModal") {
        container.removeChild(container.lastChild);
    }

    let form = document.createElement("form");
    form.name = "info";
    form.id = "mainform";

    let formDiv = create_div_id("form");
    let p = document.createElement("p");
    p.id = "form_title";
    p.textContent = "◵ Quickpic";

    let content = create_div_class("form_content");
    content.id = "form_content";

    let username = create_textField("Username", "Username", null, "text_input", "Username");
    let password = create_textField("Password", "Password", true, "text_input", "Password");

    let button = create_button("submit", "Log in");

    let span = document.createElement("span");
    span.id = "register_text";

    let a = document.createElement("a");
    a.href = "#";
    a.id = "register_button";
    a.textContent = "Register now"

    span.textContent = "Don't have an account?";
    span.appendChild(a);

    content.appendChild(username);
    content.appendChild(password);
    content.appendChild(button);
    content.appendChild(span);

    formDiv.appendChild(p);
    formDiv.appendChild(content);
    form.appendChild(formDiv);

    container.appendChild(form);

}

// Helper to create buttons
function create_button(id, text, className) {
    let button = document.createElement("button");
    button.type = "button";
    
    if (id) {
        button.id = id;
    }

    if (text) {
        button.textContent = text;
    }

    if (className) {
        button.classList.add(className);
    }

    return button;
}