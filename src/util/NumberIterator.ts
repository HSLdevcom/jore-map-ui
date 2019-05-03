const initialValue = 0;

class NumberIterator {
    num = initialValue;

    public getNumber = () => {
        return (this.num += 1);
    };

    public reset = () => {
        this.num = initialValue;
    };
}

export default new NumberIterator();
