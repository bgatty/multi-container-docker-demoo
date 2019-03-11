import React, { Component } from 'react';

//module used to make request to the backend express server
import axios from 'axios';

// This class Fib extends the Component class
class Fib extends Component{

    //Initialize the states
    state = {
        //empty array
        seenIndexes: [],
        // empty object
        values: {},
        // empty string
        index:''
    };

    //call the api
    componentDidMount(){

        // call 2 helper methods
        this.fetchValues();
        this.fetchIndexes();
    }

    // This will be async method as we are fetching data. Make request to get all the values
    async fetchValues(){
        const values = await axios.get('/api/values/current');

        // set the state on the component by passing in an object with values
        this.setState({ values: values.data });
    }

    // This will fetch all the indexes
    async fetchIndexes(){
        const seenIndexes = await axios.get('/api/values/all');

        //Update the state by passing key value pair of seendindexs and its value
        this.setState({
            seenIndexes: seenIndexes.data
        });
    }


    /**
     * When user enters the input value and clicks on the submit button, this aysnc method is called 
     * which will make a post call to the backend server
     */

     // handleSubmit is a bound function
    handleSubmit = async (event)=> {
        //prevent from the submit form to be send on its own
        event.preventDefault();

        //make post request to /api/values and send an object of key 'index' and value will be 'this.state.index'
        await axios.post('/api/values',{
            index:this.state.index
        });

        // Finally, we can query out the value of input by this stastement below
        this.setState({index:''});

    };

    //This method will return all seen indexes and display them in a comma separated value
    //Iterate over every object over the seenIndexes array and just pull out and return the number
    renderSeenIndexes(){
        return this.state.seenIndexes.map(({ number })=> number).join(',')
    }

    // Display the index and its calculated value that is stored in the Redis datbase using the key,pair values stored as objects
    renderValues(){
        const entries = [];

        for (let key in this.state.values) { 
            entries.push( 
                <div key={key}>
                For index {key}, I calculated {this.state.values[key]}
                </div>

            );
        }

        return entries;
    }




    // define a render method to display values on the UI
    render(){
        return(
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Enter your index:</label>
                    <input
                        value={this.state.index}
                        onChange={event => this.setState({index: event.target.value })}
                    
                    />
                    <button>Submit</button>
                </form>
                <h3>Indexes I have seen:</h3>
                {this.renderSeenIndexes()}
                <h3>Calculated Values:</h3>
                {this.renderValues()}
            </div>
        );
    }
}

export default Fib;