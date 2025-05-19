"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calculator } from "lucide-react"
import { cn } from "@/lib/utils"

export function QuickCalculatorModal() {
  const [display, setDisplay] = useState("0")
  const [operation, setOperation] = useState<string | null>(null)
  const [prevValue, setPrevValue] = useState<number | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const clearAll = () => {
    setDisplay("0")
    setOperation(null)
    setPrevValue(null)
    setWaitingForOperand(false)
  }

  const clearDisplay = () => {
    setDisplay("0")
    setWaitingForOperand(false)
  }

  const toggleSign = () => {
    const newValue = Number.parseFloat(display) * -1
    setDisplay(String(newValue))
  }

  const inputPercent = () => {
    const currentValue = Number.parseFloat(display)
    const newValue = currentValue / 100
    setDisplay(String(newValue))
  }

  const inputDot = () => {
    if (!/\./.test(display)) {
      setDisplay(display + ".")
      setWaitingForOperand(false)
    }
  }

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === "0" ? digit : display + digit)
    }
  }

  const performOperation = (nextOperator: string) => {
    const inputValue = Number.parseFloat(display)

    if (prevValue == null) {
      setPrevValue(inputValue)
    } else if (operation) {
      const currentValue = prevValue || 0
      let newValue: number

      switch (operation) {
        case "+":
          newValue = currentValue + inputValue
          break
        case "-":
          newValue = currentValue - inputValue
          break
        case "×":
          newValue = currentValue * inputValue
          break
        case "÷":
          newValue = currentValue / inputValue
          break
        default:
          newValue = inputValue
      }

      setPrevValue(newValue)
      setDisplay(String(newValue))
    }

    setWaitingForOperand(true)
    setOperation(nextOperator)
  }

  const handleEquals = () => {
    performOperation("=")
    setOperation(null)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-10 w-10">
          <Calculator className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>Calculadora Rápida</DialogTitle>
          <DialogDescription>Realice cálculos rápidos sin salir de la página</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4">
          {/* Display */}
          <div className="bg-muted p-4 rounded-md text-right text-2xl font-mono h-16 flex items-center justify-end overflow-hidden">
            {display}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-2">
            {/* First row */}
            <Button variant="outline" className="aspect-square text-lg font-medium" onClick={clearAll}>
              AC
            </Button>
            <Button variant="outline" className="aspect-square text-lg font-medium" onClick={clearDisplay}>
              C
            </Button>
            <Button variant="outline" className="aspect-square text-lg font-medium" onClick={inputPercent}>
              %
            </Button>
            <Button
              variant={operation === "÷" ? "default" : "outline"}
              className={cn(
                "aspect-square text-lg font-medium",
                operation === "÷" && "bg-primary text-primary-foreground",
              )}
              onClick={() => performOperation("÷")}
            >
              ÷
            </Button>

            {/* Second row */}
            <Button variant="outline" className="aspect-square text-lg font-medium" onClick={() => inputDigit("7")}>
              7
            </Button>
            <Button variant="outline" className="aspect-square text-lg font-medium" onClick={() => inputDigit("8")}>
              8
            </Button>
            <Button variant="outline" className="aspect-square text-lg font-medium" onClick={() => inputDigit("9")}>
              9
            </Button>
            <Button
              variant={operation === "×" ? "default" : "outline"}
              className={cn(
                "aspect-square text-lg font-medium",
                operation === "×" && "bg-primary text-primary-foreground",
              )}
              onClick={() => performOperation("×")}
            >
              ×
            </Button>

            {/* Third row */}
            <Button variant="outline" className="aspect-square text-lg font-medium" onClick={() => inputDigit("4")}>
              4
            </Button>
            <Button variant="outline" className="aspect-square text-lg font-medium" onClick={() => inputDigit("5")}>
              5
            </Button>
            <Button variant="outline" className="aspect-square text-lg font-medium" onClick={() => inputDigit("6")}>
              6
            </Button>
            <Button
              variant={operation === "-" ? "default" : "outline"}
              className={cn(
                "aspect-square text-lg font-medium",
                operation === "-" && "bg-primary text-primary-foreground",
              )}
              onClick={() => performOperation("-")}
            >
              -
            </Button>

            {/* Fourth row */}
            <Button variant="outline" className="aspect-square text-lg font-medium" onClick={() => inputDigit("1")}>
              1
            </Button>
            <Button variant="outline" className="aspect-square text-lg font-medium" onClick={() => inputDigit("2")}>
              2
            </Button>
            <Button variant="outline" className="aspect-square text-lg font-medium" onClick={() => inputDigit("3")}>
              3
            </Button>
            <Button
              variant={operation === "+" ? "default" : "outline"}
              className={cn(
                "aspect-square text-lg font-medium",
                operation === "+" && "bg-primary text-primary-foreground",
              )}
              onClick={() => performOperation("+")}
            >
              +
            </Button>

            {/* Fifth row */}
            <Button variant="outline" className="aspect-square text-lg font-medium" onClick={toggleSign}>
              +/-
            </Button>
            <Button variant="outline" className="aspect-square text-lg font-medium" onClick={() => inputDigit("0")}>
              0
            </Button>
            <Button variant="outline" className="aspect-square text-lg font-medium" onClick={inputDot}>
              .
            </Button>
            <Button
              variant="default"
              className="aspect-square text-lg font-medium bg-primary text-primary-foreground"
              onClick={handleEquals}
            >
              =
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
