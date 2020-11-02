import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) 
{
    return (
        <button 
            className={['square', props.winning_class].join(' ')}
            onClick={props.onClick}>
        {props.value}
        </button>
    );
}

class Board extends React.Component 
{
    renderSquare(i) 
    {
        let winning_class = "";
        if (this.props.winning_squares.includes(i))
            winning_class = "winning";

        return (
            <Square 
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                winning_class={winning_class}
            />
        );
    }

    render(props) 
    {
        let rows = new Array(3)
        let cols = new Array(3)
        for (let i = 0; i < rows.length; i++) 
        {
            cols = new Array(3)
            for (let j = 0; j < cols.length; j++)
            {
                cols[j] = this.renderSquare(i * cols.length + j);
            }
            rows[i] = 
                <div className="board-row">
                    {cols}
                </div>;
        }
        return (
            <div>
            {rows}
            </div>
        );
    }
}

class Game extends React.Component 
{
    constructor(props) 
    {    
        super(props);    
        this.state = { 
            history: [{squares: Array(9).fill(null), move: null}],
            stepNumber: 0,
            xIsNext: true,
            order: true
        };  
    }

    handleClick(i) 
    {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const [winner, winning_squares] = calculateWinner(current.squares);   
        if (winner || squares[i]) 
            return;

        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{squares: squares, move:i}]),
            xIsNext: !this.state.xIsNext,
            stepNumber: history.length,
        });
    }

    jumpTo(step) 
    {    
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    get_coordinates(i)
    {
        if (!i)
            return null;
        const row = Math.floor(i / 3) + 1;
        const column = i % 3 + 1;

        return [row,column]
    }

    sort_moves()
    {
        this.setState({
            order: !this.state.order
        });
    }

    render() 
    {
        const history = this.state.history;
        const current = history[this.state.stepNumber];    
        const [play_state, winning_squares] = calculateWinner(current.squares);    

        let moves = history.map((step, move) => {
              let styling_class = "";
              if (move == this.state.stepNumber)
                  styling_class = "bold";

              const desc = move ?
                  'Go to move #' + move : 
                  'Go to game start';
              return (
                  <li key={move}>
                      <button className={styling_class} onClick={() => this.jumpTo(move)}>{desc}</button>
                      {this.get_coordinates(step["move"])}

                  </li>      
              );
        });

        if (!this.state.order)
            moves = moves.reverse();

        let status;    
        if (play_state == "D")
            status = 'Draw';
        else if (play_state)
            status = 'Winner: ' + play_state;
        else 
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');

        return (
            <div className="game">
                <div className="game-board">
                    <Board 
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winning_squares={winning_squares}
                    />
                </div>
                <div className="game-info">
                    <div>{status}
                    </div>          
                    <ol>{moves}</ol>
                </div>
                <div className="extra-controls">
                    <button className="sort_button" onClick={() => this.sort_moves()}>
                    Sort History
                    </button>
                </div>
            </div>
        );
    }
}

function calculateWinner(squares) 
{
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) 
    {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
          return [squares[a], [a, b, c]]
        }
    }

    for (let i = 0; i < squares.length; i++) 
    {
        if (!squares[i])            
            return [null, []];
    }

    return ["D", []];    
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
