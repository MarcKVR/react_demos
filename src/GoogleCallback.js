import React, {useState, useEffect} from 'react';
import {json, useLocation} from "react-router-dom";

function GoogleCallback() {

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({});
    const [user, setUser] = useState(null);
    const location = useLocation();

    // On page load, we take "search" parameters 
    // and proxy them to /api/auth/callback on our Laravel API
    useEffect(() => {
        fetch(`http://localhost:9000/api/auth/callback${location.search}`, {
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            const userResponse = data.user;

            fetch(`http://localhost:9000/api/auth/social`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: {
                        email: userResponse.email,
                        google_id: userResponse.google_id
                    }
                }),
            })
                .then(response => response.json())
                .then(() => { console.log("Correcto")})
                .catch((error) => JSON.stringify(error)
            );

            setLoading(false);
            setData(data);
        });
    }, []);

    // Helper method to fetch User data for authenticated user
    // Watch out for "Authorization" header that is added to this call
    function fetchUserData() {
        fetch(`http://localhost:9000/api/user`, {
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': data.token_type + ' ' + data.access_token,
            }
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                setUser(data);
            });
    }

    if (loading) {
        return <DisplayLoading/>
    } else {
        if (user != null) {
            return <DisplayData data={user}/>
        } else {
            return (
                <div>
                    <DisplayData data={data}/>
                    <div style={{marginTop:10}}>
                        <button onClick={fetchUserData}>Fetch User</button>
                    </div>
                </div>
            );
        }
    }
}

function DisplayLoading() {
    return <div>Loading....</div>;
}

function DisplayData(data) {
    return (
        <div>
            <samp>{JSON.stringify(data, null, 2)}</samp>
        </div>
    );
}

export default GoogleCallback;