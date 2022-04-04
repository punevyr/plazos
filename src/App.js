import React, { useState, useEffect } from "react";
import axios from "axios"
import './App.css';
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { NetworkType } from "@airgap/beacon-sdk";

const Tezos = new TezosToolkit('https://mainnet.smartpy.io');
const wallet = new BeaconWallet({ name: "Plazos" });
Tezos.setWalletProvider(wallet);

function App() {
  let rows = 100
  let cols = 100
  let prevclickid = -1
  let currentSub = { color: "", id: -1 }
  const [color, setColor] = useState("#1f1f1f");
  const [id, setId] = useState("#1f1f1f");

  const placeContract = "KT1EtJGZoYXQBAJ3g4QA5hWZaLDukLwuta7C";


  let shut = false;

  function shade(id){
    const c = document.getElementById("colorpicker")
    setColor(c.value)
    const div3 = document.getElementById(id)
    div3.style.setProperty("background-color", c.value)
    currentSub.id = parseInt(div3.id)
    currentSub.color = c.value.toString()
    prevclickid = div3.id
    setId(div3.id)
    setColor(c.value)
  }


  function draw(initialCells) {
    
    let container = document.getElementById("container")
    for (let i = 0; i < initialCells.length; i++) {
      const div = document.createElement('div')
      div.classList.add('pixel')
      div.id = i
      div.style.backgroundColor = initialCells[i]
      container.appendChild(div)
      div.onclick = function(e) { 
        if (prevclickid != -1) {
          const div2 = document.getElementById(prevclickid)
          div2.style.backgroundColor = initialCells[prevclickid]
        }
        shade(e.target.id)
      
      };
      
    }

  }

async function login(){
  const permissions = await wallet.client.requestPermissions({
    // network: {
    //   type: NetworkType.MAINNET,
    //   rpcUrl: "https://mainnet-tezos.giganode.io/",
    // },
    network: {
      type: NetworkType.MAINNET,
      rpcUrl: "https://mainnet.smartpy.io",
    },
  });
  sendToChain()

}

  async function sendToChain() {//final part of minting process, sends ipfs cid to blockchain
    const contract = await Tezos.wallet.at(
      "KT1EtJGZoYXQBAJ3g4QA5hWZaLDukLwuta7C"
    );

    const activeAccount = await wallet.client.getActiveAccount();
      // console.log(typeof currentSub.color.toString(),typeof parseInt(ok2))

    const result = await contract.methods
      .default(color,id)
      .send();
    // As soon as the operation is broadcast, you will receive the operation hash
    return result.opHash;
  }

  useEffect(() => {
    async function getPixels() {
      let initialCells = Array.from({ length: 10000 }, () => "#ffffff");
  
      let api2 = `https://api.mainnet.tzkt.io/v1/contracts/${placeContract}/storage`
  
      axios.get(api2)
        .then(res => {
          let bmv = res.data.pixels
          let api = `https://api.mainnet.tzkt.io/v1/bigmaps/${bmv}/keys`
          axios.get(api)
            .then(response => {
              for (var i in response.data) {
                initialCells[parseInt(response.data[i].key)] = response.data[i].value
  
              }
              draw(initialCells)
            }).catch(e => console.log("api error", e))
  
        }).catch(e => console.log("api error", e))
      // setCells(initialCells)
  
    }
    getPixels()
  }, []);

  return (
    <div className="App">
      <div className="navbar">
        <button className="button" onClick={()=>login()}>Submit to chain</button>
        <input id="colorpicker" type="color" value={color} onChange={e => {currentSub.color = (e.target.value);setColor(e.target.value)}} className="color_ip"></input><a>&#11013;Choose color</a>
        <div className="fr"><a  href="https://twitter.com/punevyr">@punevyr</a></div>
      </div>
      <div id="container" className="container"> </div>
      
     
    </div>
  );
}

export default App;
