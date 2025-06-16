import { useCallback, useEffect, useState } from "react";
import "./styles.css";
import BN from "bn.js";
import { Network, Psbt } from "bitcoinjs-lib";

const x = () => {
  const psbt = Psbt.fromHex(
    "70736274ff01007d020000000110a414c8cc4c51bfb82c8f0032cacc5a7771f6e69edf8a408ca3d6b1dcd46b430100000000ffffffff02102700000000000022512084cf852ee26cdf41df46d06352743cfc760e23630cb3b0d271063ee5849cf9030b91020000000000160014c1b513f166c38493d39b71a28236a209f2ffc5f8000000000001011f10be020000000000160014c1b513f166c38493d39b71a28236a209f2ffc5f8000000"
  );

  const transaction = psbt.extractTransaction().toHex();
  console.log(transaction);
};

export default function App() {
  const [provider, setProvider] = useState(undefined);
  const [addresses, setAddress] = useState([]);
  const [resultHash, setResultHash] = useState("");
  const [error, setError] = useState(undefined);
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [Psbt, setPsbt] = useState("");
  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const getProvider = useCallback(() => {
    if (window.SubWalletBitcoin) {
      setProvider(window.SubWalletBitcoin);
    } else {
      setError("Please install OpenBit wallet");
    }
  }, []);

  useEffect(() => {
    getProvider();
  }, [getProvider]);

  const getAddress = useCallback(async () => {
    try {
      if (provider) {
        const addresses = await provider.request("getAddresses");
        setAddress(addresses);
      } else {
        getProvider();
      }
    } catch (e) {
      setError(e.message);
    }
  }, [provider, getProvider]);

  const signMessgae = useCallback(
    async (address) => {
      try {
        setResultHash("");
        if (provider) {
          const result = await provider.request("signMessage", {
            message: "Hello world",
            address,
          });

          console.log(result);
          setResultHash(result.signature);
        } else {
          getProvider();
        }
      } catch (e) {
        setError(e.message);
      }
    },
    [provider, getProvider]
  );

  // /isolate insane fat mesh account green runway much machine square reflect pupil claw help quantum south motion square neutral chicken express exile cricket crack

  const transfer = useCallback(
    async (event) => {
      event.preventDefault();
      setIsLoading(true);
      setResultHash("");
      console.log(Number.parseInt(amount * 10 ** 8));
      try {
        if (provider) {
          console.log(provider);
          const result = await provider.request("sendTransfer", {
            account: sender,
            // "tb1qpm2duck3g53gj7lms30numwefgj39g6wvw6m48"
            recipients: [
              {
                address: recipient,
                // "tb1qw5k3jylesvj2v8r5s0kq0mquwyw0hzewats8j3"
                amount: `${Number.parseInt(amount * 10 ** 8)}`,
              },
            ],
            network: "testnet",
          });
          console.log(result);

          setResultHash(result.txid);
        } else {
          getProvider();
        }
      } catch (e) {
        console.log(e);
        setError(`${e}`);
      }

      setIsLoading(false);
    },
    [provider, getProvider, recipient, amount, sender]
  );

  const signPsbt = useCallback(async () => {
    try {
      if (provider) {
        const psbt = JSON.parse(Psbt);
        const result = await provider.request("signPsbt", psbt);

        setResultHash(result.psbt);

        if (result.txid) {
          console.log(psbt.txid);
        }
      }
    } catch (e) {
      console.log(e);
      setError(`${e}`);
    }
  }, [provider, getProvider, Psbt]);

  const onChangeAddressRecipient = useCallback((event) => {
    setRecipient(event.target.value);
  }, []);

  const onChangeAddressSender = useCallback((event) => {
    setSender(event.target.value);
  }, []);

  const onChangePsbtValue = useCallback((event) => {
    setPsbt(event.target.value);
  }, []);

  const onChangeAmount = useCallback((event) => {
    setAmount(event.target.value);
  }, []);

  return (
    <div className="App">
      <h1>BTC Dapp Testing</h1>
      <button onClick={getAddress}>Connect</button>
      <div className="row">
        <h2>Addresses</h2>
        {addresses &&
          addresses.map((acc, index) => (
            <div key={acc.publicKey} className={"item"}>
              <div className="address">Address: {acc.address}</div>
              <div className="symbol">Type: {acc.type}</div>
              <div className="network">
                Network: {acc.isTestnet ? "testnet" : "mainnet"}{" "}
              </div>
              <div className="publicKey">Public key: {acc.publicKey}</div>
              <button onClick={() => signMessgae(acc.address)}>
                SignMessage
              </button>
            </div>
          ))}
      </div>
      <div className="row">
        <h2>Transfer</h2>
        <form>
          <input
            placeholder="Sender"
            value={sender}
            onChange={onChangeAddressSender}
          />
          <input
            placeholder="Recipients"
            value={recipient}
            onChange={onChangeAddressRecipient}
          />
          <input
            type={"number"}
            placeholder="Amount"
            value={amount}
            onChange={onChangeAmount}
          />
          <button type="submit" onClick={transfer} disabled={isLoading}>
            {isLoading ? "Loading" : "Send"}
          </button>
        </form>
      </div>
      <div className="row">
        <h2>Sign Psbt</h2>

        <textarea
          placeholder="Psbt"
          value={Psbt}
          onChange={onChangePsbtValue}
        />
        <button onClick={signPsbt}>Send</button>
      </div>
      <div className="row">
        <h2>Result</h2>
        <div>{resultHash}</div>
      </div>
      <div className="row">
        <h2> Error</h2>
        <div>{error}</div>
      </div>
    </div>
  );
}

// {
//   "psbt":"70736274ff01007d020000000103a75944046b5fbf1b9bce69f3e8c1dea94dd26de2be982235259ae38d2e1daa0000000000ffffffff02e40c000000000000225120f59e97246bcbd9f4a65af03c3ed89adc791d120c5ce44b73a4ff63a6e61930c723790100000000001600140ed4de62d14522897bfb845f3e6dd94a2512a34e000000000001011fa0860100000000001600140ed4de62d14522897bfb845f3e6dd94a2512a34e000000",
//    "address": "tb1qpm2duck3g53gj7lms30numwefgj39g6wvw6m48",
//    "network": "testnet",
//   "broadcast": true
// }
// cHNidP8BAF4CAAAAAaNpSPC88OPgzxaAa9nvmkLl8jXA2YSleuEur2QHJsdHAAAAAAD; /////AYCWmAAAAAAAIlEgCu6vAmP1QX5AhQ7wTPc/QyCbE0AQOMLNNNIBteaFYm4AAAAAAAEAsgIAAAACAM+PnrdM2kWF7wj+eEOSEzjEqk23YGKqy0eg0cJm77EAAAAAAP3///9GrRcgXIpDchW3KqLDQiqQsRrQNBHShyFpueM+eCsJ/AAAAAAA/f///wJeAgAAAAAAACJRIArurwJj9UF+QIUO8Ez3P0MgmxNAEDjCzTTSAbXmhWJuECcAAAAAAAAiUSB0ikrh9fAHqBgnD71cdxwfjmd1izS+KcSEG1L4/YO6rAAAAAABASteAgAAAAAAACJRIArurwJj9UF+QIUO8Ez3P0MgmxNAEDjCzTTSAbXmhWJuAQMEgwAAAAAA
//   tb1psnaergv47c8a2xt4hr6mgq84a2v2z95zpe7sr5qy7jjwau73k4fqt7rff3

//70736274ff0100c502000000027ff730b7a826442f405f5bb03611129284773445d146cdba4b46d48f8262e3380100000000ffffffff23096808eba47e34fadfe220d3a4e5eb36ead609576fa705c6bf458be8b7e5e60100000000ffffffff03e803000000000000160014752d1913f98324a61c7483ec07ec1c711cfb8b2e4f539c02000000001600140ed4de62d14522897bfb845f3e6dd94a2512a34e000000000000000022512084fb91a195f60fd51975b8f5b400f5ea98a116820e7d01d004f4a4eef3d1b552000000000001011fc4579c02000000001600140ed4de62d14522897bfb845f3e6dd94a2512a34e01086c02483045022100993c204a1f82a81ac6e35e5d7a63adfa4415baf42ef433c508df6db21ba517b002200dd3d2be993ce1a1a94542117e69ec640b929d042a564adcb5da173a14d66e77012103e3b2496726151fac3e2025209ba3e55caa5ee5dfa0ba166ff507549c555d7cc90001012b960f00000000000022512084fb91a195f60fd51975b8f5b400f5ea98a116820e7d01d004f4a4eef3d1b552011720dbd9f32c6631786803215b97a2b2b8622a12cdf339b861b2230c35a642c533ba00000000
//70736274ff0100c502000000027ff730b7a826442f405f5bb03611129284773445d146cdba4b46d48f8262e3380100000000ffffffff23096808eba47e34fadfe220d3a4e5eb36ead609576fa705c6bf458be8b7e5e60100000000ffffffff03e803000000000000160014752d1913f98324a61c7483ec07ec1c711cfb8b2e4f539c02000000001600140ed4de62d14522897bfb845f3e6dd94a2512a34e000000000000000022512084fb91a195f60fd51975b8f5b400f5ea98a116820e7d01d004f4a4eef3d1b552000000000001011fc4579c02000000001600140ed4de62d14522897bfb845f3e6dd94a2512a34e0001012b960f00000000000022512084fb91a195f60fd51975b8f5b400f5ea98a116820e7d01d004f4a4eef3d1b5520108420140f0476b5edaca9f81a3d89ba8aed38213dd0c43e05bf37e3bcbd56eb0169b177a125c0b4493b554905614f2b8cded01f28bf3f4d563428ae17c3f58272340a4af00000000

//70736274ff0100c502000000027ff730b7a826442f405f5bb03611129284773445d146cdba4b46d48f8262e3380000000000ffffffff23096808eba47e34fadfe220d3a4e5eb36ead609576fa705c6bf458be8b7e5e60100000000ffffffff0360900f0000000000160014765ff71e121ed5a10e26b74138547c1517d280cb2b31c30d000000001600140ed4de62d14522897bfb845f3e6dd94a2512a34e2b31c30d0000000022512084fb91a195f60fd51975b8f5b400f5ea98a116820e7d01d004f4a4eef3d1b552000000000001011f0312cb0d000000001600140ed4de62d14522897bfb845f3e6dd94a2512a34e01086b024730440220505e96022164cd5119e8e46fa2accbcee874167fd795281fcfd1c10658b93ca00220217cc42c7cbb94a396e5e1e7fe6d7f197abdc51cd47d60d552b68f9be6915e41012103e3b2496726151fac3e2025209ba3e55caa5ee5dfa0ba166ff507549c555d7cc90001012b0312cb0d0000000022512084fb91a195f60fd51975b8f5b400f5ea98a116820e7d01d004f4a4eef3d1b552011720dbd9f32c6631786803215b97a2b2b8622a12cdf339b861b2230c35a642c533ba00000000
