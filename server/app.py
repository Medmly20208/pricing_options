# backend/app/main.py
from fastapi import FastAPI,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import scipy.stats as se
import yfinance as yf
from typing import Literal

app = FastAPI()

class MonteCarloInput(BaseModel):
    ticker: Literal["AAPL", "AMZN", "GOOGL", "META", "TSLA", "NVDA"]
    strike: float
    r: float  # discount rate
    sigma: float  # volatility
    T: float  # time to maturity (in years)
    type: Literal["call", "put"]
    simulations: int  # number of simulation paths


class BlackScholesInput(BaseModel):
    ticker: Literal["AAPL", "AMZN", "GOOGL", "META", "TSLA", "NVDA"]
    strike: float
    r: float  # discount rate
    sigma: float  # volatility
    T: float  # time to maturity (in years)
   
    type: Literal["call", "put"]


class EulerMaryoumaInput(BaseModel):
    ticker: Literal["AAPL", "AMZN", "GOOGL", "META", "TSLA", "NVDA"]
    strike: float
    r: float  # discount rate
    sigma: float  # volatility
    T: float  # time to maturity (in years)
    N:int # number of subdivisions
    simulations: int  # number of simulation paths
    type: Literal["call", "put"]

# Allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://pricing-option-black-scholes.netlify.app","pricing-option-black-scholes.netlify.app","https://pricing-option-black-scholes.netlify.app/","pricing-option-black-scholes.netlify.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/hello")
def read_root():
    return {"message": "Hello from FastAPI"}




def d1(spot, strike, r, sigma, T):
    return (np.log(spot / strike) + (r + sigma ** 2 / 2) * T) / (sigma * np.sqrt(T))

def d2(spot, strike, r, sigma, T):
    return d1(spot, strike, r, sigma, T) - sigma * np.sqrt(T)

def call_value(spot, strike, r, sigma, T):
    return spot * se.norm.cdf(d1(spot, strike, r, sigma, T)) - strike * np.exp(-r * T) * se.norm.cdf(d2(spot, strike, r, sigma, T))

def put_value(spot, strike, r, sigma, T):
    return strike * np.exp(-r * T) * se.norm.cdf(-d2(spot, strike, r, sigma, T)) - spot * se.norm.cdf(-d1(spot, strike, r, sigma, T))

@app.post("/black-scholes")
def black_scholes(params: BlackScholesInput):
     # Fetch spot price from yfinance
    try:
        ticker_data = yf.Ticker(params.ticker)
        spot_price = ticker_data.history(period="1d")["Close"].iloc[-1]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stock data: {e}")

    # Calculate option price
    if params.type == "call":
        price = call_value(spot_price, params.strike, params.r, params.sigma, params.T)
    else:
        price = put_value(spot_price, params.strike, params.r, params.sigma, params.T)

    return {
        "ticker": params.ticker,
        "spot_price": spot_price,
        "option_type": params.type,
        "option_price": price
    }


def get_nbr_steps(T:float):
    return int(T * 252)  # Assuming 252 trading days in a year

@app.post("/monte-carlo")
def monte_carlo(params: MonteCarloInput):
     # Fetch spot price from yfinance
    try:
        ticker_data = yf.Ticker(params.ticker)
        spot_price = ticker_data.history(period="1d")["Close"].iloc[-1]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stock data: {e}")
    

    N_steps = get_nbr_steps(params.T)
    dt = params.T / N_steps
    drift = (params.r - (params.sigma ** 2)/2) * dt
    a = params.sigma * np.sqrt(dt)
    x = np.random.normal(size=(params.simulations, N_steps))
    smat = np.zeros((params.simulations, N_steps ))
    smat[:, 0] = spot_price
    for t in range(1, N_steps):
        smat[:, t] = smat[:, t-1] * np.exp(drift + a * x[:, t])
    
    q = smat[:, -1]-params.strike
    p = params.strike-smat[:, -1]
    for i in range(len(q)):
        if q[i] < 0:
            q[i] = 0
        if p[i] < 0:
            p[i] = 0
    
    if params.type == "call": 
        price = np.exp(-params.r * params.T) * np.mean(q)
    else:
        price = np.exp(-params.r * params.T) * np.mean(p)
    
    return {
        "ticker": params.ticker,
        "spot_price": spot_price,
        "option_type": params.type,
        "simulation_matrix": smat.tolist(),
        "option_price": price
    }


@app.post("/euler-maruyama")
def euler_maryauma(params: EulerMaryoumaInput):
    try:
        ticker_data = yf.Ticker(params.ticker)
        spot_price = ticker_data.history(period="1d")["Close"].iloc[-1]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stock data: {e}")

  
    S0 = spot_price
    N = params.N              # nombre de subdivisions
    T = params.T              # maturité
    r = params.r              # taux sans risque
    sigma = params.sigma      # volatilité
    M = params.simulations     # nombre de trajectoires
    dt = T / N                # Δt
    K = params.strike         # prix d'exercice

   
    smat = np.zeros((M, N + 1))
    smat[:, 0] = S0

    
    for i in range(M):
        for k in range(1, N + 1):
            Z = np.random.normal(0, 1)
            smat[i, k] = smat[i, k-1] + r * smat[i, k-1] * dt + sigma * smat[i, k-1] * np.sqrt(dt) * Z

   
    ST = smat[:, -1]  # Valeurs du stock à l'échéance
    if params.type == 'call':
        payoffs = np.maximum(ST - K, 0)
    elif params.type == 'put':
        payoffs = np.maximum(K - ST, 0)
    else:
        raise ValueError("option_type doit être 'call' ou 'put'.")

    # 6. Prix de l'option : moyenne des payoffs actualisés
    option_price = np.exp(-r * T) * np.mean(payoffs)

    return {
        "ticker": params.ticker,
        "spot_price": S0,
        "option_type": params.type,
        "option_price": option_price,
        "simulation_matrix": smat.tolist()
    }


   
