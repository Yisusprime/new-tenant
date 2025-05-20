"use client"

import { useState, useEffect, useRef } from "react"
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
  const [expression, setExpression] = useState("")
  const [operation, setOperation] = useState<string | null>(null)
  const [prevValue, setPrevValue] = useState<number | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const dialogContentRef = useRef<HTMLDivElement>(null)

  const clearAll = () => {
    setDisplay("0")
    setExpression("")
    setOperation(null)
    setPrevValue(null)
    setWaitingForOperand(false)
  }

  const clearDisplay = () => {
    setDisplay("0")
    setWaitingForOperand(false)
  }

  const deleteLastDigit = () => {
    if (display.length > 1) {
      const newDisplay = display.slice(0, -1)
      setDisplay(newDisplay)

      // Actualizar la expresión
      if (operation) {
        setExpression((prevExpression) => {
          const parts = prevExpression.split(" ")
          parts.pop() // Eliminar el último número
          return [...parts, newDisplay].join(" ")
        })
      } else {
        setExpression(newDisplay)
      }
    } else {
      setDisplay("0")
      if (!operation) {
        setExpression("0")
      }
    }
  }

  const toggleSign = () => {
    const newValue = Number.parseFloat(display) * -1
    setDisplay(String(newValue))

    // Actualizar la expresión si estamos esperando un operando
    if (waitingForOperand) {
      setExpression((prevExpression) => {
        const parts = prevExpression.split(" ")
        parts.pop() // Eliminar el último número
        return [...parts, newValue].join(" ")
      })
    } else {
      setExpression(String(newValue))
    }
  }

  const inputPercent = () => {
    const currentValue = Number.parseFloat(display)
    const newValue = currentValue / 100
    setDisplay(String(newValue))

    // Actualizar la expresión si estamos esperando un operando
    if (waitingForOperand) {
      setExpression((prevExpression) => {
        const parts = prevExpression.split(" ")
        parts.pop() // Eliminar el último número
        return [...parts, newValue].join(" ")
      })
    } else {
      setExpression(String(newValue))
    }
  }

  const inputDot = () => {
    if (!/\./.test(display)) {
      const newDisplay = display + "."
      setDisplay(newDisplay)

      // Actualizar la expresión
      if (waitingForOperand) {
        setExpression((prevExpression) => {
          const parts = prevExpression.split(" ")
          const lastPart = parts.pop() || "" // Obtener el último operador
          return [...parts, lastPart, "0."].join(" ")
        })
        setWaitingForOperand(false)
      } else {
        setExpression(newDisplay)
      }
    }
  }

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)

      // Actualizar la expresión añadiendo el nuevo dígito después del operador
      setExpression((prevExpression) => {
        return prevExpression + " " + digit
      })

      setWaitingForOperand(false)
    } else {
      const newDisplay = display === "0" ? digit : display + digit
      setDisplay(newDisplay)

      // Actualizar la expresión
      if (operation) {
        // Si ya hay una operación, actualizar el segundo operando
        setExpression((prevExpression) => {
          const parts = prevExpression.split(" ")
          parts.pop() // Eliminar el último número
          return [...parts, newDisplay].join(" ")
        })
      } else {
        // Si no hay operación, actualizar el primer operando
        setExpression(newDisplay)
      }
    }
  }

  const performOperation = (nextOperator: string) => {
    const inputValue = Number.parseFloat(display)

    if (prevValue == null) {
      setPrevValue(inputValue)
      setExpression(`${inputValue} ${nextOperator}`)
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
        case "*":
          newValue = currentValue * inputValue
          break
        case "÷":
        case "/":
          newValue = currentValue / inputValue
          break
        default:
          newValue = inputValue
      }

      // Crear la expresión completa para el historial
      const fullExpression = `${currentValue} ${operation} ${inputValue} = ${newValue}`

      // Add to history when an operation is completed
      if (nextOperator === "=") {
        setHistory((prev) => [fullExpression, ...prev].slice(0, 4))
        setExpression(`${newValue}`)
      } else {
        setExpression(`${newValue} ${nextOperator}`)
      }

      setPrevValue(newValue)
      setDisplay(String(newValue))
    }

    setWaitingForOperand(true)
    setOperation(nextOperator === "=" ? null : nextOperator)
  }

  const handleEquals = () => {
    performOperation("=")
  }

  // Manejador de eventos de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      // Prevenir comportamiento predeterminado para evitar que las teclas afecten la página
      event.preventDefault()

      const { key } = event

      // Números
      if (/^[0-9]$/.test(key)) {
        inputDigit(key)
      }
      // Operadores
      else if (key === "+") {
        performOperation("+")
      } else if (key === "-") {
        performOperation("-")
      } else if (key === "*") {
        performOperation("×")
      } else if (key === "/") {
        performOperation("÷")
      }
      // Igual y Enter
      else if (key === "=" || key === "Enter") {
        handleEquals()
      }
      // Punto decimal
      else if (key === "." || key === ",") {
        inputDot()
      }
      // Escape para limpiar todo
      else if (key === "Escape") {
        clearAll()
      }
      // Backspace para borrar último dígito
      else if (key === "Backspace") {
        deleteLastDigit()
      }
      // Delete para limpiar display
      else if (key === "Delete") {
        clearDisplay()
      }
      // Porcentaje
      else if (key === "%") {
        inputPercent()
      }
    }

    // Solo añadir el event listener cuando el modal está abierto
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, display, operation, prevValue, waitingForOperand])

  // Enfocar el diálogo cuando se abre
  useEffect(() => {
    if (isOpen && dialogContentRef.current) {
      dialogContentRef.current.focus()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-300 hover:bg-gray-700 hover:text-white">
          <Calculator className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent ref={dialogContentRef} className="sm:max-w-[350px]" tabIndex={-1}>
        <DialogHeader>
          <DialogTitle>Calculadora Rápida</DialogTitle>
          <DialogDescription>
            Realice cálculos rápidos sin salir de la página.
            <span className="block mt-1 text-xs text-gray-500">
              Puede usar el teclado numérico y los operadores (+, -, *, /, =, Enter, Backspace, Esc)
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4">
          {/* History */}
          {history.length > 0 && (
            <div className="bg-gray-100 p-3 rounded-md text-sm font-mono max-h-24 overflow-y-auto">
              {history.map((item, index) => (
                <div key={index} className="text-right text-gray-600 mb-1">
                  {item}
                </div>
              ))}
            </div>
          )}

          {/* Expression Display */}
          <div className="bg-gray-50 p-2 rounded-md text-right text-sm font-mono h-8 flex items-center justify-end overflow-hidden text-gray-500">
            {expression || "0"}
          </div>

          {/* Result Display */}
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
            <Button variant="outline" className="aspect-square text-lg font-medium" onClick={deleteLastDigit}>
              ⌫
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
