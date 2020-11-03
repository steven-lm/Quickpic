// when importing 'default' exports, use below syntax
import API from './api.js';

// render functions
import {show_register, show_createPostPrompt, show_dialog, show_main, create_div_id, create_post_container,load_userRight, load_profile_page,
        show_home, show_settings, create_commentContainer, show_userPage, changeToFollow, changeToUnfollow, show_editPrompt, show_following_modal
        ,add_following, show_noFollowing, reset_page} from './functions.js';


const api  = new API('http://127.0.0.1:5000');

// Store token
let token = null;

// Save the state of feed
let feed_point = 0;

// Poll server for push notifications
var poll; 

// Copy of latest feed (Push notifications)
var latest_feed = null;

// Information from latest feed in local storage
var offline_feed;

// Copy of user info
var user_info;

// Check if event listener for scrolled has been 'fired', this prevents the infinite scroll from making too many calls too quickly
var fired = false;

let  register = document.getElementById("register_button");
register.addEventListener("click", show_register);

let submit = document.getElementById("submit");
submit.addEventListener("click", submit_form_loginpage);

// Fragment based URL routing 
function location_hash_change() {

    let profileRegex = RegExp('profile\=(.*)$')

    // If loading a user profile
    if (profileRegex.test(location.hash)) {
        let match = profileRegex.exec(location.hash);
        match = match[0].replace("profile=","");
        
        // If user isn't logged in yet
        if (!user_info) {
            show_dialog("You must login first!");
            return;
        }

        // If profile name is user's own name or "me", redirect to own page
        if (match === user_info["username"]) {
            load_profile_page(user_info);
            render_profile_page();
            return;
        }

        if (match === "me") {
            load_profile_page(user_info);
            render_profile_page();
            return;
        }
    
        load_user_profile(null, match);

        console.log("Loading profile");
    } 

    // If loading feed
    if (location.hash === '#feed') {

        // If user isn't logged in yet
        if (!user_info) {
            show_dialog("You must login first!");
            return;
        }

        show_home();
        load_feed(user_info["id"]);
        render_home();
        console.log("Loading feed");
      }
}
  
// Add fragment based url routing to page
window.onhashchange = function () {location_hash_change()}

// Start/stop poll to check for push notifications
function start_poll() { 
    poll = setInterval(function() {  
        console.log("Checking feed update");
        check_feed_update();
    }, 5000); 
} 
  
function stop_poll() { 
    console.log("Stopping background poll");
    clearInterval(poll);  
} 

// Infinite scroll loading - add more posts to feed 
function show_loading_animation() {
    const loading = document.querySelector('.loading');
	loading.classList.add('show');
    
    // Load more data
    // User can only load more to the feed every 3 seconds
    if (fired === false) {
        setTimeout(show_morePosts, 500);
        setTimeout(function() {
            fired = false;
        }, 2000)
        fired = true;
    }
}

// Hide loading animation
function hide_loading_animation() {
    const loading = document.querySelector('.loading');
	loading.classList.remove('show');
}

// Load offline feed from localStorage
function load_offline_feed() {
    offline_feed = localStorage.getItem("offline_feed");
    offline_feed = JSON.parse(offline_feed);
        
    if (offline_feed["posts"].length === 0) {
        show_no_posts();
    }

    let feed = document.getElementById("feed");

    for (let post in offline_feed["posts"]) {
        feed.appendChild(create_post_container(offline_feed["posts"][post], user_info["id"]));
        render_commentBox(posts[post]["id"]);
    }      
}

// Submit details for either login or register
function submit_form_loginpage() {
    let infoForm = document.forms.info;
    let type = submit.textContent;

    if (type === "Register") {
        console.log("Signing up!");

        // REGISTER
        let user = infoForm.Username.value;
        let password = infoForm.Password.value;
        let password_confirm = infoForm.ConfirmPassword.value;
        let email = infoForm.Email.value;
        let name = infoForm.Name.value;

        // Show error dialog if passwords don't match
        if (password !== password_confirm) {
            show_dialog("Passwords don't match!");
            return;
        }

        // Show error dialog and highlight fields if fields are missing
        if (!email || !name || !user || !password || !password_confirm) {
            show_dialog("One or more fields are missing!");
            show_missing_fields(user, password, password_confirm, email, name);
            return;
        }

        // If email is invalid (Does have @) 
        if (email) {
            let emailReg = new RegExp(".@.");
            if (!emailReg.test(email)) {
                show_dialog("Please enter a valid email", true);
                return;
            }
        }

        let data = {
            "username": user,
            "password": password,
            "email": email,
            "name": name
        }

        // If signup successful show and render main page
        api.post("auth/signup", data)
        .then(res => {
            token = res['token'];
            console.log("Signed up successfully");
            show_main();
            render_main(token);
        })
        .catch(err => show_dialog(err))

    } else {
        console.log("Logging in!");

        // LOGIN 
        let user = infoForm.Username.value;
        let password = infoForm.Password.value;

        // Show error if any field is missing
        if (!user || !password) {
            show_dialog("One or more fields are missing!");
            show_missing_fields(user, password);
            return;
        }

        // Render main page if login succesful
        api.post("auth/login", {"username": user, "password": password, })
        .then(res => {
            token = res['token']; console.log("Logged in successfully"); 
            show_main();
            render_main(token);
        })
        .catch(err => show_dialog(err))
    }
}

// Highlight missing fields for form data
function show_missing_fields(user, password, password_confirm, email, name) {
    if (!user) {
        red_highlight_field("Username");
    }

    if (!password) {
        red_highlight_field("Password");
    }

    if (!email) {
        red_highlight_field("Email");
    }

    if (!name) {
        red_highlight_field("Name");
    }

    if (!password_confirm) {
        red_highlight_field("ConfirmPassword");
    }

}

function red_highlight_field(field) {
    let f = document.getElementById(field);
    f.style.borderColor = "red";
    f.onclick = function () {f.style.borderColor = "black";};
}

// Render main when the user first logs in
function render_main(token) {
    load_searchBar();
    load_exit();
    api.get("user/",token)
    .then(res => {
        let username = res['username'];
        let name = res['name'];
        let following = res['following'];
        let follower = res['followed_num'];
        user_info = res;

        load_right_profile(username, name, follower, Object(following).length);
        load_feed(res['id']);
        render_home();

        let home = document.getElementById("homeIcon");
        home.toggleAttribute("on");
        let profileButton = document.getElementById("profileIcon");
        
        profileButton.onclick = function() {
            load_profile_page(user_info);
            render_profile_page();
        };
    })
    .catch(err => show_dialog(err));
}

// Load user information and images on the right tab
function load_right_profile(username, name, followernum, followingnum) {
    console.log(token);
    let profile = document.getElementById("rightProfile");
    let icon = document.createElement("img");
    icon.alt = "profile image"
    icon.src = "/images/profilepic.png";

    let container = create_div_id("rightProfileInfoContainer");

    let user = create_div_id("rightProfileUser", username);
    let rightname = create_div_id("rightProfileName", name);
 
    container.appendChild(icon);

    let names = create_div_id("rightNames");
    names.appendChild(user);
    names.appendChild(rightname);

    let followerInfo = create_div_id("followerInfo");
    let followingCount = create_div_id("followerBox");
    let followerCount = create_div_id("followerBox");

    let followerIcon = document.createElement("img");
    followerIcon.alt = "followers icon";
    followerIcon.src = "/images/followersicon.png";

    let followingIcon = document.createElement("img");
    followingIcon.alt = "following icon";
    followingIcon.src = "/images/followingicon.png";
    followingIcon.id = "followingIcon"

    followerCount.appendChild(followerIcon);
    followerCount.appendChild(create_div_id("follower_count", followernum));

    followingCount.appendChild(followingIcon);
    followingCount.appendChild(create_div_id("following_count", followingnum));

    followerInfo.appendChild(followingCount);
    followerInfo.appendChild(followerCount);

    container.appendChild(names);    
    profile.appendChild(container);
    profile.appendChild(followerInfo);
}

// Load user feed (for home page)
function load_feed() {
    let feed = document.getElementById("feed");
    feed.textContent = "";
    
    // Only load 5 posts at a time
    let queries = {"n": 5};
    api.get("user/feed",token, queries)
    .then(res => {
        let posts = res["posts"];
        
        if (posts.length === 0) {
            show_no_posts();
        }

        let feed = document.getElementById("feed");

        for (let post in posts) {
            feed.appendChild(create_post_container(posts[post], user_info["id"]));
            render_commentBox(posts[post]["id"]);
        }      

        latest_feed = res["posts"];
        // Store newest feed in local storage for offline access
        localStorage.setItem("offline_feed", JSON.stringify(posts));

        feed_point = 5;
        start_poll();
        add_infinite_scroll();
    }).catch(err => {show_dialog(err); load_offline_feed()});
}

// Load the feed of a specific user (When visiting their page)
function load_user_feed(username) {
    let queries = {"username": username};
    api.get("user/",token, queries)
    .then(res => {
        let feed = document.getElementById("feed");

        let posts = res["posts"];
        if (posts.length === 0) {
            show_no_posts();
            return;
        }

        let n = posts.length;

        for (let i = 0; i < n; i++) {
            let queries = {"id": posts[i]};
            api.get("post/", token, queries)
            .then(p => {
                feed.appendChild(create_post_container(p, user_info["id"], true));
                render_commentBox(p["id"], true);
                render_editButton(p["id"]);
            }).catch(err => show_dialog(err));
            
        }   
    });
}

// Load a specific user profile
function load_user_profile(id, username) {
    console.log("loading someones profile");
    let following = document.getElementById("show_following");
    if (following) {
        following.id = "followingIcon";
        following.onclick = function () {
        }
    }

    let queries;
    if (username) {
        queries = {"username": username};
    } else {
        id = "" + id;
        queries = {"id": id};
    }
    api.get("user/",token, queries)
    .then(res => {
        // Fetch user information to check if following has changed at all (Prevents a bug in the follow/unfollow button when moving between user profiles quickly)
        api.get("user/",token)
        .then(res2 => {
            user_info = res2;

            let id = res["id"];
            show_userPage(user_info["following"].includes(id));
            render_userProfileRight(res["username"], res["name"], res["followed_num"], Object(res["following"]).length);
            render_bannerButtons();
            stop_poll();
            remove_infinite_scroll();
            
            // If user has no posts, show prompt
            let posts = res["posts"];
            if (posts.length === 0) {
                show_no_posts();
                return;
            }
    
            let n = posts.length;
    
            for (let i = 0; i < n; i++) {
                let queries = {"id": posts[i]};
                api.get("post/", token, queries)
                .then(p => {
                    feed.appendChild(create_post_container(p, user_info["id"]));
                    render_commentBox(p["id"], true);
                }).catch(err => show_dialog(err));
                
            }   
        })
        .catch(err => show_dialog(err));      
    }).catch(err => show_dialog(err));
}

// Render user's own profile page
function render_profile_page() {
    console.log("rendering profile page");
    stop_poll()
    remove_infinite_scroll();
    api.get("user/",token)
    .then(res => {
        user_info = res;
        load_userRight(user_info);
    })
    .catch(err => show_dialog(err));

    let button = document.getElementById("changeSettingsButton");
    if (button.style.display === "none") {
        button.style.display = null;
    }

    let following = document.getElementById("followingIcon");
    if (following) {
        following.id = "show_following";

        following.onclick = function () {
            show_following();
        }
    }

    let homeButton = document.getElementById("homeIcon");
    if (homeButton.hasAttribute("on")) {
        homeButton.toggleAttribute("on");
    }

    let profileButton = document.getElementById("profileIcon");
    profileButton.toggleAttribute("on");

    let user = document.getElementById("rightProfileUser");

    profileButton.onclick = function() {};

    homeButton.onclick = function() {
        show_home();
        load_feed(user_info["id"]);
        render_home();
    };

    let settings = document.getElementById("changeSettingsButton");
    settings.onclick = function() {show_settings(user_info["email"]); render_settings()};

    load_user_feed(user.textContent);
}

// Render home page
function render_home() {
    let homeButton = document.getElementById("homeIcon");
    homeButton.onclick = function() {};

    let following = document.getElementById("followingIcon");
    if (following) {
        following.id = "show_following";

        following.onclick = function () {
            show_following();
        }
    }

    api.get("user/",token)
    .then(res => {
        user_info = res;
        load_userRight(user_info);
    })
    .catch(err => show_dialog(err));


    let profileButton = document.getElementById("profileIcon");
    profileButton.onclick = function() {
        load_profile_page(user_info);
        render_profile_page();
    };

    let postButton = document.getElementById("createPostButton");
    if (postButton.style.display === "none") {
        postButton.style.display = null;
    }
    postButton.onclick = function() {
        create_post();
    };

}

// Show prompt for when theres nothing to show in the feed
function show_no_posts() {
    let feed = document.getElementById("feed");

    let show = create_div_id("no_posts");
    show.textContent = "No posts to show!";
    feed.appendChild(show);
}

// Render functionality within a comment box (For making comments and liking the post)
function render_commentBox(id, onUserPage) {
    render_CommentButton(id);
    render_likeButton(id);

    // Do not render follow/unfollow button if on user's own profile page
    if (!onUserPage) {
        render_postHeader(id);
    }
}

// Render the functionality of like buttons on the post
function render_likeButton(id) {
    let button = document.getElementById("heart" + id);
    if (button.hasAttribute("liked")) {
        button.onclick = function() {
            unlike_post(id);
        }
    }  else {
        button.onclick = function() {
            like_post(id);
        }
    }
}

// Render functionality of clicking on header which leads user to their public profile
function render_postHeader(id) {
    let header = document.getElementById("header" + id);

    let author = header.childNodes[1].childNodes[0].textContent;
    header.onclick = function() {
        load_user_profile("", author);
    }

}

// Additional rendering to a user's public page (this deals with the difference between the users own page and other peoples pages)
function render_userPage(id) {
    let home = document.getElementById("homeIcon");
    home.onclick = function () {
        show_home();
        load_feed();
        render_home();
    }

    let profileButton = document.getElementById("profileIcon");
    profileButton.onclick = function() {
        load_profile_page(user_info);
        render_profile_page();
    };

    load_user_profile(id);

    let follow = document.getElementById("follow");
    if (!follow) {
        follow = document.getElementById("unfollow");
    }

    if (id === user_info["id"]) {
        follow.remove();
    }
}

// Unlike a post and update it live
function unlike_post(id) {
    let queries = {"id": id};
    api.put("post/unlike", token, queries)
    .then(res => {
        let button = document.getElementById("heart" + id);
        button.toggleAttribute("liked");
        let likes = document.getElementById("likes" + id);

        let num = parseInt(likes.textContent) - 1;
        num = "" + num;
        likes.textContent = num;
        render_likeButton(id);
    })
    .catch(err => show_dialog(err));
}

// Like post and update it live
function like_post(id){
    let queries = {"id": id};
    api.put("post/like", token, queries)
    .then(res => {
        let button = document.getElementById("heart" + id);
        button.toggleAttribute("liked");
        let likes = document.getElementById("likes" + id);

        let num = parseInt(likes.textContent) + 1;
        num = "" + num;
        likes.textContent = num;
        render_likeButton(id);

    })
    .catch(err => show_dialog(err));
}

// Render functionality of comment button, allows user to click button to post comment
function render_CommentButton(id) {

    let button = document.getElementById("post" + id);
     button.onclick = function() {
        let text = document.getElementById("text" + id).value;
        post_comment(text, id);
    }; 
}

// Send request to post comment
function post_comment(text,id) {
    let queries = {"id": id};
    api.put("post/comment", token, queries, {"comment": text})
    .then(res => {
        let comments = document.getElementById("comments" + id);
        let meta = {"author": user_info["username"], "comment": text, "published": Math.round(Date.now() / 1000)}
        comments.appendChild(create_commentContainer(meta))

        // Clear textarea after commenting
        document.getElementById("text" + id).value = '';

    }).catch(err => show_dialog(err));
}

// Render settings page, adding email and form functionality
function render_settings() {
    stop_poll();
    let button = document.getElementById("update");
    button.onclick = function () {
        let form = document.forms.settings;

        let newName = form.newName.value;
        let newEmail = form.newEmail.value;
        let newPass = form.newPass.value;
        let passConfirm = form.newPassConfirm.value;

        // Show error dialog if all fields are empty
        if (!newName && !newEmail && !newPass && !passConfirm) {
            show_dialog("You must update at least one setting!", true);
            return;
        }

        if (newEmail) {
            let emailReg = new RegExp(".@.");
            if (!emailReg.test(newEmail)) {
                show_dialog("Please enter a valid email", true);
                return;
            }
        }

        // Show error dialog if passwords don't match
        if (newPass !== passConfirm) {
            show_dialog("Passwords don't match!", true);
            return;
        }

        api.put_settings("user/", token, {"email": newEmail, "name": newName, "password": newPass})
        .then(res =>
            {
            if (newName) {
                update_newName(newName);
            }

            if(newEmail) {
                update_newEmail(newEmail);
            }

            show_dialog("Details updated!");
            }
        ).catch(err => show_dialog(err));
    }

    let user = document.getElementById("rightProfileUser");
    let settings = document.getElementById("changeSettingsButton");

    // Clicking the settings button again will return user to profile page
    settings.onclick = function() {
        let feed = document.getElementById("feed");
        feed.textContent = "";

        load_user_feed(user.textContent);
        let settings = document.getElementById("changeSettingsButton");
        settings.onclick = function() {show_settings(user_info["email"]); render_settings()};
    };

}

// Load searchbar on first load of main page
function load_searchBar() {
    
    let banner = document.getElementById("banner");

    let form = document.createElement("form");
    form.name = "search";
    form.id = "searchBar";

    let input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Search..";
    input.name = "search";

    let button = document.createElement("button");
    button.type = "button";
    button.id = "searchButton";

    let i = document.createElement("i");
    i.classList.add("fa", "fa-search");

    button.appendChild(i)

    form.appendChild(input);
    form.appendChild(button);


    banner.insertBefore(form, banner.children[1]);
    banner.insertBefore(create_div_id("banner_fill"), banner.children[2]);

    button.onclick = function() {
        submit_search();
    }
    
}

// Load exit icon
function load_exit() {
    let exit = document.getElementById("exitIcon");

    exit.onclick = function() {

        stop_poll()
        reset_page();

        token = null;
        user_info = null;

        register = document.getElementById("register_button");
        register.addEventListener("click", show_register);
        
        submit = document.getElementById("submit");
        submit.addEventListener("click", submit_form_loginpage);    
    }
}

// Submit a search request
function submit_search() {
    let form = document.forms.search;

    let username = form.search.value;

    if (!username) {
        show_dialog("Please enter a username to search!", true);
        return;
    }

    if (username === user_info["username"]) {
        load_profile_page(user_info);
        render_profile_page();
        return;
    }

    load_user_profile(null, username);
}

// Update right tab information
function render_userProfileRight(username, name, followed, following) {
    let rightUsername = document.getElementById("rightProfileUser");
    let rightName = document.getElementById("rightProfileName");
    let followers_n = document.getElementById("follower_count");
    let following_n = document.getElementById("following_count");

    rightUsername.textContent = username;
    rightName.textContent = name;
    followers_n.textContent = followed;
    following_n.textContent = following;

    let button = document.getElementById("follow");
    if (!button) {
        button = document.getElementById("unfollow");
    }

    if (username === user_info["username"]) {
        button.remove();
        return;
    }

    render_followButtons(rightUsername);
}

// Add functionality to follow / unfollow buttons
function render_followButtons(rightUsername) {
    let button = document.getElementById("follow");
    if (!button) {
        console.log("unfollow button");
        button = document.getElementById("unfollow");
    } else {
        console.log("follow button");
    }

    if (button.id === "follow") {
        button.onclick = function () {
            let queries = {"username":  rightUsername.textContent};
            api.put("user/follow", token, queries)
            .then(res => {changeToUnfollow(); render_followButtons(rightUsername);})
            .catch(err => show_dialog(err));
        }
    } else {
        button.onclick = function () {
            let queries = {"username":  rightUsername.textContent};
            api.put("user/unfollow", token, queries)
            .then(res => {changeToFollow(); render_followButtons(rightUsername);})
            .catch(err => show_dialog(err));
        }
    }
}

// Fix onclicks of banner icons
function render_bannerButtons() {
    let home = document.getElementById("homeIcon");
    home.onclick = function () {
        show_home();
        load_feed();
        render_home();
    }

    let profileButton = document.getElementById("profileIcon");
    profileButton.onclick = function() {
        load_profile_page(user_info);
        render_profile_page();
    };

}

// Load prompt and send request for creating post
function create_post() {
    show_createPostPrompt();
    let modal = document.getElementById("myModal");
    let content = document.getElementById("modal_content");
    let button = document.getElementById("confirmPostButton");
    button.onclick = function () {
        let form = document.forms.post;

        let desc = form.postInput.value;
        let file = document.getElementById("fileUpload").files[0];

        console.log(desc)
        getBase64(file).then(
            data => {

            // Remove the meta data from the base64 string
            let baseURI = data.split(',')[1];


            let payload = {"description_text": desc, "src": baseURI};

            api.post_image("post", payload, token)
            .then(res => {
                modal.style.display = "none";
                while (content.lastChild.id !== "modal_close") {
                    content.removeChild(content.lastChild);
                }
                show_dialog("Upload complete!")
            })
            .catch(err => {
                let text = document.getElementById("modal_text");
                if (text) {
                    text.remove();
                }
    
                show_dialog(err);
            });

        }
        ).catch(err => {
            let text = document.getElementById("modal_text");
            if (text) {
                text.remove();
            }

            show_dialog("You must provide an image and description, try again!", true);
        });

    }
}

// Convert an image file to base 64
function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
}

// Render button and submit request to edit a post
function render_editButton(id) {
    let button = document.getElementById("edit"+id);
    let modal = document.getElementById("myModal");
    let content = document.getElementById("modal_content");
    button.onclick = function () {
        show_editPrompt();
        let button = document.getElementById("editPostButton");
        button.onclick = function () {
            let form = document.forms.edit;
    
            let desc = form.postInput.value;

            if (!desc) {
                show_dialog("New description cannot be empty!", true);
                return;
            }

            let payload = {"description_text": desc};
            let queries = {"id": id}

            api.put("post",token, queries, payload)
            .then(res => {
                modal.style.display = "none";
                while (content.lastChild.id !== "modal_close") {
                    content.removeChild(content.lastChild);
                }
                update_description(id, desc);
                show_dialog("Post Updated!");
            })
            .catch(err => {
                let text = document.getElementById("modal_text");
                if (text) {
                    text.remove();
                }
    
                show_dialog(err);
            });

    
        }

        // Render and submit request for deleting a post
        let deleteButton = document.getElementById("deletePostButton"); 
        deleteButton.onclick = function () {
            let queries = {"id": id}
            api.delete("post", token, queries)
            .then(res => {
                modal.style.display = "none";
                while (content.lastChild.id !== "modal_close") {
                    content.removeChild(content.lastChild);
                }
                remove_post(id);
                show_dialog("Post deleted!")
            })
            .catch(err => {
                show_dialog(err);
            });
        }
        
    }
}

// Live update of a post description
function update_description(id, desc) {
    let d = document.getElementById("desc" + id);
    d.textContent = desc;
}

// Live update of a post deletion
function remove_post(id) {
    let p = document.getElementById("postcontainer" + id);
    p.remove();

    let feed = document.getElementById("feed");
    if (!feed.firstChild) {
        show_no_posts();
    }
}

// Open modal which shows the people the user follows
function show_following() {
    show_following_modal();

    let following = user_info["following"];
    if (Object(following).length === 0) {
        show_noFollowing();
        return;
    }

    for (let id in following) {
        let queries = {"id": following[id]};
        api.get("user", token, queries)
        .then(res => {
            console.log(res["username"]);
            add_following(res["username"]);
            render_unfollow(res["username"]);
        })
        .catch(err => show_dialog(err));
    }
}

// Render unfollow button within the "following" modal
function render_unfollow(username) {
    let button = document.getElementById("unfollow"+username);
    button.onclick = function() {
        let queries = {"username":  username};
        api.put("user/unfollow", token, queries)
        .then(res => {remove_username_modal(username);})
        .catch(err => show_dialog(err));
    }
}

// Live update removing user from the "following" modal
function remove_username_modal(username) {
    let user = document.getElementById("info"+username);
    user.remove();
    api.get("user/",token)
    .then(res => {
        user_info = res;
        load_userRight(user_info);
    })
    .catch(err => show_dialog(err));
}

// Add 5 more posts to feed (Part of infinite scroll)
function show_morePosts() {

    let n = 5;
    let queries = {"p": feed_point, "n": 5};
    api.get("user/feed",token, queries)
    .then(res => {
        let posts = res["posts"];

        let feed = document.getElementById("feed");

        for (let post in posts) {
            feed.appendChild(create_post_container(posts[post], user_info["id"]));
            render_commentBox(posts[post]["id"]);
        }      
        feed_point = feed_point + n; 
        hide_loading_animation();
    }).catch(err => show_dialog(err));   
}

// Retrieve latest feed and compare to old feed, showing a notification if a user they follow has recently made a new post
function check_feed_update() {
    let queries = {"n": 5}
    api.get("user/feed",token, queries)
    .then(res => {
        let posts = res["posts"];
        for (let post in posts) {
            let found = 0;
            for (let old in latest_feed) {
                if (posts[post]["id"] === latest_feed[old]["id"]) {
                    found = 1;
                }
            }

            if (found === 0) {
                show_dialog(`${posts[post]["meta"]["author"]} just made a new post!`);
                latest_feed = posts;
                // Store newest feed in local storage for offline access
                localStorage.setItem("offline_feed", JSON.stringify(posts));
            }
        }      

    }).catch(err => show_dialog(err));
}

// Add infinite scroll functionality
function add_infinite_scroll() {
    document.body.addEventListener('scroll', check_scroll);
}

// Remove infinite scroll functionality 
function remove_infinite_scroll() {
    document.body.removeEventListener('scroll', check_scroll);
    hide_loading_animation();
}

// Check current scroll position, if the position is almost at the end of the page, load more posts (Only works on the home/main page)
function check_scroll() {
    let curr = document.documentElement.scrollTop || document.body.scrollTop;
    let end = document.body.scrollHeight - document.documentElement.scrollHeight - 20;

    // If scroll reaches end of page, load more
    if(curr >= end) {
        show_loading_animation();
    }
}

// Live update new name after updating in settings
function update_newName(name) {
    let rightName = document.getElementById("rightProfileName");
    rightName.textContent = name;
}

// Live update new email after updating in settings
function update_newEmail(email) {
    let e = document.getElementById("email_box");

    user_info["email"] = email;
    e.textContent = email;
}