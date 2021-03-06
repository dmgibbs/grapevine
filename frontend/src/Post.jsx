import React from 'react';
import { Container,  Row,Col } from 'reactstrap';

import {Redirect} from 'react-router-dom'
import Wishlist from './Wishlist.jsx';
import SecondLevelTrade from './SecondLevelTrade';
import Resource from './models/resource'
import PostMap from './PostMap.jsx';

const PostStore = Resource('posts');
const Trade = Resource('trades');

class Post extends React.Component {
  constructor(props) {
    super(props)
    console.log("-------------constructor props", props);
    this.state = {
      post_id : (props.match.params.post_id || null ),
      post:{ user:{wishlist:[]}, food:"", location:"" } ,
      errors: null,
      typeOfTrade: "twoway",
      redirect:'',
      collapse: false,
      selected_food_item:"",
      current_user: 1,
      isHidden:true,
      radio_selection:"",
      offered_item:"",
      secondlevel_trade:"",
      trade_list:"",        // list of 2rd level trades
      trade_radio_select:"",
      trade_id: ""          // the associated id of the trade radio button

    }
  }

  componentDidMount() {

    PostStore.find(this.state.post_id)
    .then((result) =>{
      console.log("---------------result from did mount", result);
      this.setState({
        post: result,
        errors: null,
        show: true,
        redirect: ''
      })
      console.log(' user selected: ', this.state.selected);
    })
    .catch((errors) => this.setState({errors: errors}))
  }

  select  =  (event) => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
      value: event.target.innerText
    });
  }

  handleTradeButton = async (event) =>{

    event.preventDefault();
    // Check the state variable to determine the type of trade to execute
    if (this.state.typeOfTrade ==="twoway"){
      console.log("2way called")
      if (!this.state.radio_selection){
        alert("Please select an item to trade.")
        return;
      }
     this.handleTwoWayTrade(event)
    } else if (this.state.typeOfTrade ==="threeway"){
      console.log("entering 3way with  wishitem of ", this.state.radio_selection)
      if (this.state.radio_selection){
        alert("Please clear selection to go on")
        return;
      }
      if (this.state.radio_selection) {  // if they chose an item from 1st menu
        alert("Unselect the item chosen to see possible 3way trades")
        return;
      }
      this.handleThreeWayTrade(event);

    }
  }

  closeTrades = (event) =>{
    event.preventDefault(event);
    const checkIsHidden = this.state.isHidden
    this.setState({isHidden: !checkIsHidden})

  }


  clear_Radio = (event) =>{
    event.preventDefault(event);
    this.setState({
        radio_selection:false
      });
  }

  handleChange = async (event) => {
    event.preventDefault();

    console.log("got called !!")

    this.setState({
      selected_food_item: event.target.value,
      dropdownOpen: !this.state.dropdownOpen,

    })

    let result = await fetch(`http://localhost:8080/posts/${this.state.post_id}/secondarylist/1`,
    { method:'GET', mode:'cors'})
    .then( result  =>{
      return result.json();
      // console.log("data stores:" , result.json())
    })
    this.setState({trade_list:result})
  }

  handleRadioChange = (event) => {
    console.log("radio button item: ",event.target.value)
    this.setState({
      radio_selection: event.target.value
    });
  }

  handleTradeAction = (event) =>{
    // process the result from what was chosen from
    // second level menu
    event.preventDefault();
    this.setState({trade_radio_select: event.target.value})
  }

  handleTradeRadioChange = (event) =>{
    console.log(event.target);
    console.log(event.target.value);
    this.setState({
      trade_radio_select: event.target.value,
      typeOfTrade: "threeway",
      trade_id: event.target.getAttribute("id")
    });
    console.log("radio button index:",event.target.getAttribute('id'));
  }

  handleThreeWayTrade = (event) =>{
    event.preventDefault();
    event.stopPropagation()   // prevents the nested from also triggering parent form

    console.log("Confirm Trade",this.state.trade_radio_select, " ID: ",this.state.trade_id, typeof this.state.trade_id)
    let temp = Number(this.state.trade_id);
    let trade_data = this.state.trade_list;
    console.log("This is trades list: ",this.state.trade_list,"temP: ",temp);
    let i = 0;
    let the_data={};
    for (var item in trade_data){
      if (i === temp){
         the_data[item]= trade_data[item];
      }
      i++;
    }
    // Attempt to push the 3way trade info to the trade table.
    // Need to confirm with Jordan
    console.log("middleman info  ", the_data)

    Trade.create(JSON.stringify( {
      middle_man: the_data,
      post_id: this.state.post_id,
      current_user: this.state.current_user }))
      .then(response => {
        this.setState({trade_id:response.data})
        console.log("data from 3way trade: ",response.data)
        const Url = this.buildUrl(response.data) // sets up localhst
        console.log("new url for 3way: ",Url)
        this.setState({redirect: Url})
      })
    }

  buildUrl =   (param)  => {
    return `/trades/${param}`;
  }

  handleTwoWayTrade = (event) => {
    let sel_food="";
    event.preventDefault();


    Trade.create(JSON.stringify({
      selected_food_item : this.state.radio_selection,
      post_id:this.state.post_id,
      current_user: this.state.current_user,
      })
      ) .then ( response => {
        this.setState({trade_id:response.data})
        const Url = this.buildUrl(response.data) // sets up localhst
        this.setState({redirect: Url})
      })
    }

  handleClick = (ev) => {
    ev.preventDefault();
    this.setState({show:true});
  }

  toggle = () => {
    this.setState({ collapse: !this.state.collapse });
  }

  toggleHidden =() =>  {
    this.setState({
      isHidden: !this.state.isHidden
    })
  }


  render () {
    let userwishlist = this.state.post.user.wishlist;

    if (this.state.redirect !== '') {
      return <Redirect to={this.state.redirect} />
    }

  console.log("-------------latitude", this.state.post.location.latitude)
  console.log("-------------longitude", this.state.post.location.longitude)

  return (
    <Container id="post-container">
      <div id='post-food-picture'>
        <img className="imgView" src={this.state.post.food_picture_url} alt="" />
      </div>

      <h2 id="post-food-name">
        {this.state.post.food.name}
      </h2>

      <p id="post-description">
        {this.state.post.description}
      </p>

      {this.state.post.location.latitude && this.state.post.location.longitude &&
        <div id="post-map">
          <PostMap
            mapboxApiAccessToken="pk.eyJ1Ijoiamt5b3VuZ3MiLCJhIjoiY2ptbnpoOG9xMHpoejNrbnlxYjcwbjE2aCJ9.nQQU3n63lrlEQw6N1Odtxg"
            latitude={this.state.post.location.latitude}
            longitude={this.state.post.location.longitude}
          />
        </div>
      }

      <div id="post-avatar">
        <img id="user-avatar" src={this.state.post.user.avatar} />
      </div>

      <div id="post-username-rating">
        <h3>{this.state.post.user.username}</h3>
        <div>
          <img className="grapes" src="/purplegrapes.svg" />
          <img className="grapes" src="/purplegrapes.svg" />
          <img className="grapes" src="/purplegrapes.svg" />
          <img className="grapes" src="/purplegrapes.svg" />
          <img className="grapes" src="/cleargrapes.svg" />
        </div>
      </div>

      <button  id="show-wishlist" onClick={this.toggleHidden}>
        Wishlist
      </button>


      {!this.state.isHidden &&
        <div id="wishlist">
          <Wishlist list={userwishlist} form_action = {this.handleChange}
            radio_action = {this.handleRadioChange}
            radio_select ={this.state.radio_selection}
            clear_Radio = {this.clear_Radio}
            poster_name = {this.state.post.user.username}
            posted_food = {this.state.post.food.name}

            trade_radio_action = {this.handleTradeRadioChange}
            trade_radio_select = {this.state.trade_radio_select}
            trade_list         = {this.state.trade_list}
            trade_form_action  = {this.handleThreeWayTrade}
            closeTrades        = {this.closeTrades}
          />
          <button id="submit-button" onClick={this.handleTradeButton}>
            Make Offer
          </button>
        </div>
      }


    </Container>
    );
  };
}

export default Post;


      // {!this.state.isHidden &&
      //   <div id="secondarylist">
      //     <SecondLevelTrade trade_list = {this.state.trade_list}
      //       trade_form_action  = {this.handleThreeWayTrade}
      //       trade_radio_select = {this.state.radio_selection}
      //       trade_radio_action = {this.handleTradeAction}
      //       poster_name        = {this.state.post.user.username}
      //     />
      //   </div>
      // }